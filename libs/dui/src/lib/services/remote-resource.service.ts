import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  expand,
  filter,
  firstValueFrom,
  forkJoin,
  from,
  last,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

import { DataFetchingService, FetchDataParams } from '../internal/data-fetching.service';
import { logSubscription } from '../utils/logging';
import { ActionHook, ActionHookService } from './events-and-actions/action-hook.service';
import { InterpolationService } from './interpolation.service';
import {
  getStatesAsContext,
  getStatesSubscriptionAsContext,
  StateMap,
} from './state-store.service';
import {
  RemoteResourceTemplate,
  RemoteResourceTemplateService,
  RemoteResourceTemplateWithStatus,
  Request,
} from './templates/remote-resource-template.service';

export type RemoteResourceState = {
  status: 'init' | 'completed' | 'error';
  isLoading: boolean;
  isError: boolean;
  result: unknown | null;
};

export type RemoteResourcesStates = {
  results: {
    [remoteResourceId: string]: RemoteResourceState;
  };
  isAllLoading: boolean;
  isPartialLoading: string[];
  isAllError: boolean;
  isPartialError: string[];
};

type AccumulatedRequestsResults = unknown[];

export type RequestConfigsInterpolationContext = {
  state: StateMap;
  $requests?: AccumulatedRequestsResults;
};

export type RequestTransformationInterpolationContext = RequestConfigsInterpolationContext & {
  $current: unknown;
};

export type RequestHooksInterpolationContext = {
  state: StateMap;
  $result: unknown;
};

export const getRemoteResourcesStatesAsContext = (
  remoteResourceIds: string[]
): Observable<RemoteResourcesStates> => {
  const remoteResourceService = inject(RemoteResourceService);

  const remoteResourcesStatesMap: { [id: string]: Observable<RemoteResourceState> } =
    remoteResourceIds.reduce(
      (acc, curId) => ({ ...acc, [curId]: remoteResourceService.getRemoteResourceState(curId) }),
      {}
    );

  return combineLatest(remoteResourcesStatesMap).pipe(
    map((statesMap) => {
      const isAllLoading = Object.entries(statesMap).every(([, state]) => state.isLoading);
      const isPartialLoading: string[] = Object.entries(statesMap).reduce(
        (acc, [curId, curState]) => {
          if (curState.isLoading) {
            return [...acc, curId];
          }

          return acc;
        },
        [] as string[]
      );
      const isAllError = Object.entries(statesMap).every(([, state]) => state.isError);
      const isPartialError: string[] = Object.entries(statesMap).reduce(
        (acc, [curId, curState]) => {
          if (curState.isError) {
            return [...acc, curId];
          }

          return acc;
        },
        [] as string[]
      );

      return {
        results: statesMap,
        isAllLoading,
        isPartialLoading,
        isAllError,
        isPartialError,
      };
    })
  );
};

const getResourceRequestConfigInterpolationContext = (
  accumulatedRequestsResults: AccumulatedRequestsResults
): Observable<RequestConfigsInterpolationContext> => {
  const state = getStatesAsContext();
  const $requests = of(accumulatedRequestsResults);

  return combineLatest({
    $requests,
    state,
  }).pipe(
    shareReplay({
      refCount: true,
      bufferSize: 1,
    })
  );
};

const getResourceRequestTransformationInterpolationContext = (params: {
  accumulatedRequestsResults?: AccumulatedRequestsResults;
  currentRequestResult?: unknown;
}): Observable<RequestTransformationInterpolationContext> => {
  const { accumulatedRequestsResults, currentRequestResult } = params;
  const state = getStatesAsContext();
  const $requests = of(accumulatedRequestsResults);
  const $current = of(currentRequestResult);

  return combineLatest({
    $requests,
    state,
    $current,
  }).pipe(
    shareReplay({
      refCount: true,
      bufferSize: 1,
    })
  );
};

const getResourceRequestHooksInterpolationContext = (
  transformationResult: unknown
): Observable<RequestHooksInterpolationContext> => {
  const state = getStatesAsContext();
  const $result = of(transformationResult);

  return combineLatest({
    $result,
    state,
  }).pipe(
    shareReplay({
      refCount: true,
      bufferSize: 1,
    })
  );
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

  readonly #dataFetchingService = inject(DataFetchingService);
  readonly #interpolationService = inject(InterpolationService);
  readonly #remoteResourceTemplateService = inject(RemoteResourceTemplateService);
  readonly #actionHookService = inject(ActionHookService);
  readonly #environmentInjector = inject(EnvironmentInjector);

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

  #processRequestsInSequence(requests: Request[]): Observable<unknown> {
    let currentRequestIndex = 0;

    return of([]).pipe(
      expand((accumulatedRequestsResults) => {
        if (currentRequestIndex >= requests.length) {
          return EMPTY;
        }
        const curReq = requests[currentRequestIndex] as Request;
        currentRequestIndex++;
        return from(
          this.#interpolateSequencedRequestOptions(curReq, accumulatedRequestsResults)
        ).pipe(
          switchMap((interpolatedRequestOptions) =>
            this.#dataFetchingService.fetchData(interpolatedRequestOptions)
          ),
          switchMap((requestResult) =>
            from(
              this.#interpolateSequencedRequestResult(
                curReq,
                requestResult,
                accumulatedRequestsResults
              )
            )
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

  #processRequestsInParallel(requests: Request[]): Observable<unknown[]> {
    return from(this.#interpolateParallelRequestOptions(requests)).pipe(
      switchMap((interpolatedRequestOptions) =>
        forkJoin(
          interpolatedRequestOptions.map((request) => this.#dataFetchingService.fetchData(request))
        )
      ),
      switchMap((responses) => this.#interpolateParallelRequestsResult(requests, responses))
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

    const remoteResourceTemplate$ =
      this.#remoteResourceTemplateService.getRemoteResourceTemplate(id);

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
  }): Promise<ActionHook[]> {
    const { onSuccessHooks, resourceResult } = params;

    const resourceHooksInterpolationContext = await runInInjectionContext(
      this.#environmentInjector,
      () => firstValueFrom(getResourceRequestHooksInterpolationContext(resourceResult))
    );
    try {
      const interpolatedHooks = (await this.#interpolationService.interpolate({
        value: onSuccessHooks,
        context: resourceHooksInterpolationContext,
      })) as ActionHook[];

      return interpolatedHooks;
    } catch (error) {
      console.warn('Failed to interpolate resource hooks');
      return [];
    }
  }

  async #interpolateSequencedRequestOptions(
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

  async #interpolateParallelRequestOptions(reqs: Request[]): Promise<FetchDataParams[]> {
    const currentState = await firstValueFrom(
      runInInjectionContext(this.#environmentInjector, () => getStatesAsContext())
    );
    const requestsConfigs = reqs.map((req) => req.configs);
    try {
      const interpolatedRequestOptions = (await this.#interpolationService.interpolate({
        value: requestsConfigs,
        context: currentState,
      })) as FetchDataParams[];

      return interpolatedRequestOptions;
    } catch (error) {
      console.warn('Fail to interpolate parallel requests options');
      throw error;
    }
  }

  async #interpolateSequencedRequestResult(
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

  async #interpolateParallelRequestsResult(
    reqs: Request[],
    responses: unknown[]
  ): Promise<unknown[]> {
    const results: unknown[] = [];
    for (let i = 0; i < reqs.length; i++) {
      const { interpolation } = reqs[i] as Request;
      if (interpolation) {
        const requestTransformationContext = await firstValueFrom(
          runInInjectionContext(this.#environmentInjector, () =>
            getResourceRequestTransformationInterpolationContext({
              currentRequestResult: responses[i],
            })
          )
        );

        try {
          const requestResult = await this.#interpolationService.interpolate({
            value: interpolation,
            context: requestTransformationContext,
          });
          results.push(requestResult);
        } catch (error) {
          console.warn('Failed to interpolate request result');
          results.push({ error });
          throw error;
        }
      }
    }

    return results;
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
      switchMap((rrt) => {
        const requests = rrt.config.options.requests;
        const isParallel = rrt.config.options.parallel;
        const proccessMethod = isParallel
          ? this.#processRequestsInParallel(requests)
          : this.#processRequestsInSequence(requests);

        return proccessMethod.pipe(map((result) => ({ result, remoteResourceTemplate: rrt })));
      }),
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
          this.#actionHookService.triggerActionHooks(interpolatedHooks);
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
