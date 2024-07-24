import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  expand,
  filter,
  firstValueFrom,
  from,
  last,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { UICommAction } from '../interfaces';
import { RemoteResourceTemplate, Request } from '../interfaces/RemoteResource';
import { logSubscription } from '../utils/logging';
import { DataFetchingService, FetchDataParams } from './data-fetching.service';
import {
  getResourceRequestConfigInterpolationContext,
  getResourceRequestHooksInterpolationContext,
  getResourceRequestTransformationInterpolationContext,
  getStatesSubscriptionAsContext,
} from './hooks/InterpolationContext';
import { triggerMultipleUIActions } from './hooks/UIActions';
import { InterpolationService } from './interpolation.service';
import {
  RemoteResourceTemplateService,
  RemoteResourceTemplateWithStatus,
} from './templates/remote-resource-template.service';

export type RemoteResourceState = {
  status: 'init' | 'completed' | 'error';
  isLoading: boolean;
  isError: boolean;
  result: unknown | null;
};

@Injectable({
  providedIn: 'root',
})
export class RemoteResourceService {
  #remoteResourcesStateMap: Record<string, BehaviorSubject<RemoteResourceState>> = {};
  #reloadControlSubject: Subject<string> = new Subject<string>();
  #cancelSubscriptionControlSubject: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);

  #dataFetchingService: DataFetchingService = inject(DataFetchingService);
  #interpolationService: InterpolationService = inject(InterpolationService);
  #remoteResourceTemplateService: RemoteResourceTemplateService = inject(
    RemoteResourceTemplateService
  );
  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  getRemoteResourceState(id: string): Observable<RemoteResourceState> {
    const remoteResourceState = this.#remoteResourcesStateMap[id];

    if (remoteResourceState) {
      return remoteResourceState.asObservable();
    }

    return this.#initializeRemoteResource(id);
  }

  triggerResource(id: string): void {
    const existingRemoteResourceState = this.#remoteResourcesStateMap[id];
    if (existingRemoteResourceState) {
      this.reloadResource(id);
    } else {
      this.#initializeRemoteResource(id);
    }
  }

  reloadResource(id: string): void {
    this.#reloadControlSubject.next(id);
  }

  #processRequests(requests: Request[]): Observable<unknown> {
    let currentRequestIndex = 0;

    return of([]).pipe(
      expand((accumulatedRequestsResults) => {
        if (currentRequestIndex >= requests.length) {
          return EMPTY;
        }
        const curReq = requests[currentRequestIndex] as Request;
        currentRequestIndex++;
        return from(this.#interpolateRequestOptions(curReq, accumulatedRequestsResults)).pipe(
          switchMap((interpolatedRequestOptions) =>
            this.#dataFetchingService.fetchData(interpolatedRequestOptions)
          ),
          switchMap((requestResult) =>
            from(this.#interpolateRequestResult(curReq, requestResult, accumulatedRequestsResults))
          ),
          map((interpolatedRequestResult) => [
            ...accumulatedRequestsResults,
            interpolatedRequestResult,
          ])
        );
      }),
      last(),
      // The last request result will be used as the final result for the remote resource
      map((accumulatedRequestsResults) => accumulatedRequestsResults[requests.length - 1])
    );
  }

  #triggerRemoteResourceDataFetching(id: string): void {
    const remoteResourceState = this.#remoteResourcesStateMap[id];
    if (!remoteResourceState) {
      console.warn(
        `Remote resource ${id} has not been registered or is not associated with any widget yet`
      );
      return;
    }

    const remoteResourceTemplate$ = toObservable(
      this.#remoteResourceTemplateService.getRemoteResourceTemplate(id),
      {
        injector: this.#environmentInjector,
      }
    );

    const remoteResourceFetchFlow$: Observable<boolean> = this.#generateRemoteResourceFetchFlow(
      remoteResourceTemplate$,
      remoteResourceState
    );

    const reloadControl$ = this.#reloadControlSubject.pipe(filter((reloadId) => reloadId === id));

    const statesSubscriptions$ = remoteResourceTemplate$.pipe(
      filter((rrt) => rrt.status === 'loaded'),
      switchMap((remoteResourceTemplate) => {
        const stateSubscription = remoteResourceTemplate.config.stateSubscription;
        let states: Observable<unknown> = of(EMPTY);
        if (stateSubscription) {
          states = runInInjectionContext(this.#environmentInjector, () =>
            getStatesSubscriptionAsContext(stateSubscription)
          );
        }
        return states;
      })
    );

    combineLatest([reloadControl$.pipe(startWith(true)), statesSubscriptions$])
      .pipe(
        switchMap(() => remoteResourceFetchFlow$),
        takeUntil(
          this.#cancelSubscriptionControlSubject.pipe(filter((canceledId) => canceledId === id))
        )
      )
      .subscribe(() => {
        // since there's always an initial value for state, this will always trigger when we subscribe
        // therefore initialize the fetch data workflow
        logSubscription(`Remote resource ${id} triggered`);
      });
  }

  async #interpolateResourceHooks(params: {
    onSuccessHooks: Exclude<RemoteResourceTemplate['options']['onSuccess'], undefined>;
    resourceResult: unknown;
  }): Promise<UICommAction[]> {
    const { onSuccessHooks, resourceResult } = params;

    const resourceHooksInterpolationContext = await runInInjectionContext(
      this.#environmentInjector,
      () => firstValueFrom(getResourceRequestHooksInterpolationContext(resourceResult))
    );
    try {
      const interpolatedHooks = (await this.#interpolationService.interpolate({
        value: onSuccessHooks,
        context: resourceHooksInterpolationContext,
      })) as UICommAction[];

      return interpolatedHooks;
    } catch (error) {
      console.warn('Failed to interpolate resource hooks');
      return [];
    }
  }

  async #interpolateRequestOptions(
    req: Request,
    accumulatedRequestsResults: unknown[]
  ): Promise<FetchDataParams> {
    const requestConfigInterpolationContext = await firstValueFrom(
      runInInjectionContext(this.#environmentInjector, () =>
        getResourceRequestConfigInterpolationContext(accumulatedRequestsResults)
      )
    );
    try {
      const interpolatedRequestOptions = (await this.#interpolationService.interpolate({
        value: req.configs,
        context: requestConfigInterpolationContext,
      })) as FetchDataParams;

      return interpolatedRequestOptions;
    } catch (error) {
      console.warn('Fail to interpolate request options');
      throw error;
    }
  }

  async #interpolateRequestResult(
    req: Request,
    requestResult: unknown,
    accumulatedRequestsResults: unknown[]
  ): Promise<unknown> {
    const { interpolation } = req;
    if (interpolation) {
      const requestTransformationContext = await firstValueFrom(
        runInInjectionContext(this.#environmentInjector, () =>
          getResourceRequestTransformationInterpolationContext({
            accumulatedRequestsResults,
            currentRequestResult: requestResult,
          })
        )
      );

      try {
        requestResult = await this.#interpolationService.interpolate({
          value: interpolation,
          context: requestTransformationContext,
        });
      } catch (error) {
        console.warn('Failed to interpolate request result');
        throw error;
      }
    }

    return requestResult;
  }

  #setLoadingState(remoteResourceState: BehaviorSubject<RemoteResourceState>): void {
    const currentRemoteResourceState = remoteResourceState.getValue();
    remoteResourceState.next({
      ...currentRemoteResourceState,
      isLoading: true,
    });
  }

  #setErrorState(remoteResourceState: BehaviorSubject<RemoteResourceState>): void {
    remoteResourceState.next({
      status: 'error',
      isLoading: false,
      isError: true,
      result: null,
    });
  }

  #setCompleteState(
    remoteResourceState: BehaviorSubject<RemoteResourceState>,
    result: unknown
  ): void {
    remoteResourceState.next({
      status: 'completed',
      isLoading: false,
      isError: false,
      result,
    });
  }

  #initializeRemoteResource(id: string): Observable<RemoteResourceState> {
    const newRemoteResourceState = new BehaviorSubject<RemoteResourceState>({
      status: 'init',
      isLoading: true,
      isError: false,
      result: null,
    });

    this.#remoteResourcesStateMap[id] = newRemoteResourceState;

    this.#triggerRemoteResourceDataFetching(id);

    return newRemoteResourceState.asObservable();
  }

  #generateRemoteResourceFetchFlow(
    remoteResourceTemplateObs: Observable<RemoteResourceTemplateWithStatus>,
    remoteResourceState: BehaviorSubject<RemoteResourceState>
  ): Observable<boolean> {
    return remoteResourceTemplateObs.pipe(
      filter((rrt) => rrt.status === 'loaded'),
      tap({
        next: () => this.#setLoadingState(remoteResourceState),
      }),
      switchMap((rrt) =>
        this.#processRequests(rrt.config.options.requests).pipe(
          map((result) => ({ result, remoteResourceTemplate: rrt }))
        )
      ),
      switchMap(({ result, remoteResourceTemplate }) => {
        const {
          config: {
            options: { onSuccess: onSuccessHooks },
          },
        } = remoteResourceTemplate;
        if (!onSuccessHooks?.length) {
          return of({
            result,
            interpolatedHooks: [],
          });
        }
        return from(
          this.#interpolateResourceHooks({
            onSuccessHooks: onSuccessHooks,
            resourceResult: result,
          })
        ).pipe(
          map((interpolatedHooks) => ({
            interpolatedHooks,
            result,
          }))
        );
      }),
      map(({ result, interpolatedHooks }) => {
        runInInjectionContext(this.#environmentInjector, () => {
          triggerMultipleUIActions(interpolatedHooks);
        });

        this.#setCompleteState(remoteResourceState, result);

        return true;
      }),
      catchError(() => {
        this.#setErrorState(remoteResourceState);
        return of(false);
      })
    );
  }
}
