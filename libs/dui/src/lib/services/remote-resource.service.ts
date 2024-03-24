import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  from,
  lastValueFrom,
  map,
  Observable,
  switchMap,
  tap,
} from 'rxjs';

import { RawJsString, RemoteResourceConfigs, Request } from '../interfaces/RemoteResource';
import { logInfo, logSubscription } from '../utils/logging';
import { DataFetchingService } from './data-fetching.service';
import { EventsService } from './events.service';
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

  #dataFetchingService: DataFetchingService = inject(DataFetchingService);
  #interpolationService: InterpolationService = inject(InterpolationService);
  #eventsService: EventsService = inject(EventsService);

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

    const remoteResource$ = this.getRemoteResource(id);

    const newRemoteResourceState = new BehaviorSubject<RemoteResourceState>({
      status: 'init',
      isLoading: true,
      isError: false,
      result: null,
    });

    this.#remoteResourcesStateMap[id] = newRemoteResourceState;

    remoteResource$
      .pipe(
        switchMap((remoteResource) => from(this.#processRequests(remoteResource.requests))),
        tap({
          next: (result) =>
            newRemoteResourceState.next({
              status: 'completed',
              isLoading: false,
              isError: false,
              result,
            }),
          error: () =>
            newRemoteResourceState.next({
              status: 'error',
              isLoading: false,
              isError: true,
              result: null,
            }),
        })
      )
      .subscribe(() => logSubscription(`Subscribing to remote resource ${id}`));

    return newRemoteResourceState.asObservable();
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
}
