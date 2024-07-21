import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RemoteResourceTemplate } from '@namnguyen191/dui';
import { Observable, shareReplay } from 'rxjs';

const BASE_REMOTE_RESOURCE_URL = 'http://localhost:8080/remote-resources';

@Injectable({
  providedIn: 'root',
})
export class RemoteResourcesService {
  #httpClient: HttpClient = inject(HttpClient);

  #remoteResourcesCache: Record<string, Observable<RemoteResourceTemplate>> = {};

  getRemoteResourceById(id: string): Observable<RemoteResourceTemplate> {
    let remoteResource$ = this.#remoteResourcesCache[id];
    if (!remoteResource$) {
      remoteResource$ = this.#fetchRemoteResourceById(id).pipe(shareReplay(1));
      this.#remoteResourcesCache[id] = remoteResource$;
    }

    return remoteResource$;
  }

  #fetchRemoteResourceById(id: string): Observable<RemoteResourceTemplate> {
    return this.#httpClient.get<RemoteResourceTemplate>(`${BASE_REMOTE_RESOURCE_URL}/${id}`);
  }
}
