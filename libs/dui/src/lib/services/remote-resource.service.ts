import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  from,
  lastValueFrom,
  map,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

import { RawJsString, RemoteResourceConfigs, Request } from '../interfaces/RemoteResource';
import { logInfo, logSubscription } from '../utils/logging';
import { DataFetchingService } from './data-fetching.service';
import { EventsService } from './events.service';
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
  #cancelSubscriptionControlSubject: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);

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

  async #processRequests(requests: Request[]): Promise<unknown> {
    const requestsState: {
      requestsResults: unknown[];
    } = {
      requestsResults: [],
    };
    for (const request of requests) {
      const interpolatedRequestOptions = await this.#interpolationService.interpolateObject({
        object: request.options,
        context: requestsState,
      });

      let requestResult = await lastValueFrom(
        this.#dataFetchingService.fetchData(interpolatedRequestOptions)
      );

      if (request.interpolation) {
        const rawJs =
          this.#interpolationService.extractRawJs(request.interpolation) ??
          ('return "Invalid interpolation syntax"' as RawJsString);

        requestResult = await this.#interpolationService.interpolateRawJs({
          rawJs,
          context: {
            $requests: requestsState.requestsResults,
            $current: requestResult,
          },
        });
      }

      requestsState.requestsResults.push(requestResult);
    }
    return requestsState.requestsResults[requestsState.requestsResults.length - 1];
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

    const remoteResourceFetchFlow = remoteResource$.pipe(
      tap({
        next: () => {
          const currentRemoteResourceState = remoteResourceState.getValue();

          remoteResourceState.next({
            ...currentRemoteResourceState,
            isLoading: true,
          });
        },
      }),
      switchMap((remoteResource) =>
        from(this.#processRequests(remoteResource.requests)).pipe(
          map((result) => ({ result, remoteResource }))
        )
      ),
      tap({
        next: ({ result, remoteResource }) => {
          runInInjectionContext(this.#environmentInjector, () => {
            if (remoteResource.onSuccess?.length) {
              triggerMultipleUIActions(remoteResource.onSuccess);
            }
          });

          remoteResourceState.next({
            status: 'completed',
            isLoading: false,
            isError: false,
            result,
          });
        },
        error: () =>
          remoteResourceState.next({
            status: 'error',
            isLoading: false,
            isError: true,
            result: null,
          }),
      })
    );

    this.#reloadControlSubject
      .pipe(
        filter((reloadId) => reloadId === id),
        switchMap(() => remoteResourceFetchFlow)
      )
      .subscribe(() => logSubscription(`Subscribing to remote resource ${id}`));

    this.#reloadControlSubject.next(id);
  }
}
