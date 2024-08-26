import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DataFetcher } from '@namnguyen191/dui-core';

export type HttpFetcherConfigs = {
  endpoint: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
};

@Injectable({
  providedIn: 'root',
})
export class HttpFetcherService {
  readonly #httpClient = inject(HttpClient);

  #httpFetcher: DataFetcher<HttpFetcherConfigs> = (configs: HttpFetcherConfigs) => {
    const { endpoint, method, headers, body } = configs;

    return this.#httpClient.request(method, endpoint, {
      headers,
      body,
    });
  };

  httpFetcher = this.#httpFetcher.bind(this);
}
