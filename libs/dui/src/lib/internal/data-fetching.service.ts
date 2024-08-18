import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type FetchDataParams = {
  endpoint: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
};

@Injectable({
  providedIn: 'root',
})
export class DataFetchingService {
  readonly #httpClient = inject(HttpClient);

  fetchData(params: FetchDataParams): Observable<unknown> {
    const { endpoint, method, headers, body } = params;

    return this.#httpClient.request(method, endpoint, {
      headers,
      body,
    });
  }
}
