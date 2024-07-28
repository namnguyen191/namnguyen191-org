import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, Observable } from 'rxjs';

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
  httpClient: HttpClient = inject(HttpClient);

  fetchData(params: FetchDataParams): Observable<unknown> {
    const { endpoint, method, headers, body } = params;

    return this.httpClient
      .request(method, endpoint, {
        headers,
        body,
      })
      .pipe(delay(2000));
  }
}
