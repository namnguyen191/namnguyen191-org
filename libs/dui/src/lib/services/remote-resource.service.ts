import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, delay, forkJoin, Observable, tap } from 'rxjs';

import { RemoteResourceConfigs } from '../interfaces/RemoteResource';
import { DataFetchingService } from './data-fetching.service';

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

  dataFetchingService: DataFetchingService = inject(DataFetchingService);

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

    forkJoin(remoteResource.requests.map((request) => this.dataFetchingService.fetchData(request)))
      .pipe(
        delay(3000),
        tap({
          next: (data) =>
            newRemoteResourceState.next({
              isLoading: false,
              isError: false,
              result: data,
            }),
          error: () =>
            newRemoteResourceState.next({
              isLoading: false,
              isError: true,
              result: null,
            }),
        })
      )
      .subscribe();

    return newRemoteResourceState.asObservable();
  }
}
