import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';

import { RawJsString, RemoteResourceConfigs, Request } from '../interfaces/RemoteResource';
import { DataFetchingService } from './data-fetching.service';
import { InterpolationService } from './interpolation.service';

export type RemoteResourceState = {
  isLoading: boolean;
  isError: boolean;
  result: unknown | null;
};

@Injectable({
  providedIn: 'root',
})
export class RemoteResourceService {
  #remoteResourcesMap: Record<string, RemoteResourceConfigs> = {};
  #remoteResourcesStateMap: Record<string, BehaviorSubject<RemoteResourceState>> = {};

  #dataFetchingService: DataFetchingService = inject(DataFetchingService);
  #interpolationService: InterpolationService = inject(InterpolationService);

  registerRemoteResource(remoteResource: RemoteResourceConfigs): void {
    this.#remoteResourcesMap[remoteResource.id] = remoteResource;
  }

  getRemoteResource(id: string): RemoteResourceConfigs | null {
    const remoteResource = this.#remoteResourcesMap[id] ?? null;

    if (!remoteResource) {
      console.warn(`${id} has not been registered as a Remote Resource yet!`);
    }

    return remoteResource;
  }

  getRemoteResourceState(id: string): Observable<RemoteResourceState> {
    const remoteResourceState = this.#remoteResourcesStateMap[id];

    if (remoteResourceState) {
      return remoteResourceState.asObservable();
    }

    const remoteResource = this.getRemoteResource(id);

    if (!remoteResource) {
      throw new Error(
        `Can't trigger ${id} because it has not been registered as a Remote Resource yet!`
      );
    }

    const newRemoteResourceState = new BehaviorSubject<RemoteResourceState>({
      isLoading: true,
      isError: false,
      result: null,
    });

    this.#remoteResourcesStateMap[id] = newRemoteResourceState;

    this.#processRequests(remoteResource.requests).then(
      (result) =>
        newRemoteResourceState.next({
          isLoading: false,
          isError: false,
          result,
        }),
      () =>
        newRemoteResourceState.next({
          isLoading: false,
          isError: true,
          result: null,
        })
    );

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
        state: requestsState,
      });

      let requestResult = await lastValueFrom(
        this.#dataFetchingService.fetchData(interpolatedRequestOptions)
      );

      if (request.interpolation) {
        const rawJS =
          this.#interpolationService.extractRawJs(request.interpolation) ??
          ('return "Invalid interpolation syntax"' as RawJsString);

        requestResult = await this.#interpolationService.interpolate({
          rawJS,
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
