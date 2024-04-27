import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  EMPTY,
  expand,
  filter,
  firstValueFrom,
  from,
  last,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { UICommAction } from '../interfaces';
import { RawJsString, RemoteResourceConfigs, Request } from '../interfaces/RemoteResource';
import { logInfo, logSubscription } from '../utils/logging';
import { DataFetchingService, FetchDataParams } from './data-fetching.service';
import { EventsService } from './events.service';
import {
  getResourceRequestConfigInterpolationContext,
  getResourceRequestHooksInterpolationContext,
  getResourceRequestTransformationInterpolationContext,
  getStatesSubscriptionAsContext,
} from './hooks/InterpolationContext';
import { triggerMultipleUIActions } from './hooks/UIActions';
import { InterpolationService } from './interpolation.service';

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
  #remoteResourcesMap$: BehaviorSubject<Record<string, RemoteResourceConfigs>> =
    new BehaviorSubject({});
  #remoteResourcesStateMap: Record<string, BehaviorSubject<RemoteResourceState>> = {};
  #reloadControlSubject: Subject<string> = new Subject<string>();
  #cancelSubscriptionControlSubject: BehaviorSubject<string | null> = new BehaviorSubject<
    string | null
  >(null);

  #dataFetchingService: DataFetchingService = inject(DataFetchingService);
  #interpolationService: InterpolationService = inject(InterpolationService);
  #eventsService: EventsService = inject(EventsService);
  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  registerRemoteResource(remoteResource: RemoteResourceConfigs): void {
    if (this.#remoteResourcesMap$.value[remoteResource.id]) {
      throw new Error(
        `Remote resource with id of "${remoteResource.id}" has already been register. Please update it instead`
      );
    }
    this.#remoteResourcesMap$.next({
      ...this.#remoteResourcesMap$.value,
      [remoteResource.id]: remoteResource,
    });
  }

  // TODO: keep count of how many subscriber does a remote resource have and remove it state if it has none left
  getRemoteResource<T extends string>(id: T): Observable<RemoteResourceConfigs> {
    return this.#remoteResourcesMap$.asObservable().pipe(
      distinctUntilChanged((prev, curr) => prev[id] === curr[id]),
      tap({
        next: (remoteResourceMap) => {
          if (!remoteResourceMap[id]) {
            this.#eventsService.emitEvent({
              type: 'MISSING_REMOTE_RESOURCE',
              payload: {
                id,
              },
            });
          }
        },
      }),
      filter(
        (remoteResourceMap): remoteResourceMap is Record<T, RemoteResourceConfigs> =>
          !!remoteResourceMap[id]
      ),
      map((remoteResourceMap) => {
        const remoteResource = remoteResourceMap[id];
        return remoteResource;
      }),
      tap((val) => logInfo(`Getting remote resource ${val.id}`))
    );
  }

  getRemoteResourceState(id: string): Observable<RemoteResourceState> {
    const remoteResourceState = this.#remoteResourcesStateMap[id];

    if (remoteResourceState) {
      return remoteResourceState.asObservable();
    }

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
    const remoteResource$ = this.getRemoteResource(id);

    const remoteResourceState = this.#remoteResourcesStateMap[id];

    if (!remoteResourceState) {
      console.warn(
        `Remote resource ${id} has not been registered or is not associated with any widget yet`
      );
      return;
    }

    const remoteResourceFetchFlow: Observable<void> = remoteResource$.pipe(
      tap({
        next: () => this.#setLoadingState(remoteResourceState),
      }),
      switchMap((remoteResource) =>
        this.#processRequests(remoteResource.options.requests).pipe(
          map((result) => ({ result, remoteResource }))
        )
      ),
      switchMap(({ result, remoteResource }) =>
        from(
          this.#interpolateResourceHooks({ resourceConfig: remoteResource, resourceResult: result })
        ).pipe(
          map((interpolatedHooks) => ({
            interpolatedHooks,
            result,
          }))
        )
      ),
      map(({ result, interpolatedHooks }) => {
        runInInjectionContext(this.#environmentInjector, () => {
          triggerMultipleUIActions(interpolatedHooks);
        });

        this.#setCompleteState(remoteResourceState, result);
      }),
      catchError(() => {
        this.#setErrorState(remoteResourceState);
        return of();
      }),
      takeUntil(
        this.#cancelSubscriptionControlSubject.pipe(filter((canceledId) => canceledId === id))
      )
    );

    this.#reloadControlSubject
      .pipe(
        filter((reloadId) => reloadId === id),
        switchMap(() => remoteResourceFetchFlow),
        takeUntil(
          this.#cancelSubscriptionControlSubject.pipe(filter((canceledId) => canceledId === id))
        )
      )
      .subscribe(() => logSubscription(`Subscribing to remote resource ${id}`));

    const remoteResourceSubscribable = remoteResource$.pipe(
      switchMap((remoteResource) => {
        const stateSubscription = remoteResource.stateSubscription;
        return stateSubscription ? getStatesSubscriptionAsContext(stateSubscription) : of(EMPTY);
      }),
      tap(() => this.#reloadControlSubject.next(id)),
      takeUntil(
        this.#cancelSubscriptionControlSubject.pipe(filter((canceledId) => canceledId === id))
      )
    );

    // since there's always an initial value for state, this will always trigger when we subscribe
    // therefore initialize the fetch data workflow
    remoteResourceSubscribable.subscribe(() =>
      logSubscription(`Subscribing to states for remote resource ${id}`)
    );
  }

  async #interpolateResourceHooks(params: {
    resourceConfig: RemoteResourceConfigs;
    resourceResult: unknown;
  }): Promise<UICommAction[]> {
    const { resourceConfig, resourceResult } = params;

    if (!resourceConfig.options.onSuccess?.length) {
      return Promise.resolve([]);
    }

    const resourceHooksInterpolationContext = await runInInjectionContext(
      this.#environmentInjector,
      () => firstValueFrom(getResourceRequestHooksInterpolationContext(resourceResult))
    );
    return this.#interpolationService.interpolate({
      value: resourceConfig.options.onSuccess,
      context: resourceHooksInterpolationContext,
    }) as Promise<UICommAction[]>;
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
    return this.#interpolationService.interpolateObject({
      object: req.configs,
      context: requestConfigInterpolationContext,
    });
  }

  async #interpolateRequestResult(
    req: Request,
    requestResult: unknown,
    accumulatedRequestsResults: unknown[]
  ): Promise<unknown> {
    if (req.interpolation) {
      const rawJs =
        this.#interpolationService.extractRawJs(req.interpolation) ??
        ('return "Invalid interpolation syntax"' as RawJsString);
      const requestTransformationContext = await firstValueFrom(
        runInInjectionContext(this.#environmentInjector, () =>
          getResourceRequestTransformationInterpolationContext({
            accumulatedRequestsResults,
            currentRequestResult: requestResult,
          })
        )
      );

      requestResult = await this.#interpolationService.interpolateRawJs({
        rawJs,
        context: requestTransformationContext,
      });
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
}
