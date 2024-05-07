import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RemoteResourceConfigs } from '@namnguyen191/dui';
import { delay, Observable, shareReplay } from 'rxjs';

const BASE_REMOTE_RESOURCE_URL = 'http://localhost:8080/remote-resources';

@Injectable({
  providedIn: 'root',
})
export class RemoteResourcesService {
  #httpClient: HttpClient = inject(HttpClient);

  #remoteResourcesCache: Record<string, Observable<RemoteResourceConfigs>> = {};

  getRemoteResourceById(id: string): Observable<RemoteResourceConfigs> {
    let remoteResource$ = this.#remoteResourcesCache[id];
    if (!remoteResource$) {
      remoteResource$ = this.#fetchRemoteResourceById(id).pipe(shareReplay(1));
      this.#remoteResourcesCache[id] = remoteResource$;
    }

    return remoteResource$;
  }

  #fetchRemoteResourceById(id: string): Observable<RemoteResourceConfigs> {
    return this.#httpClient
      .get<RemoteResourceConfigs>(`${BASE_REMOTE_RESOURCE_URL}/${id}`)
      .pipe(delay(2000));
  }
}
