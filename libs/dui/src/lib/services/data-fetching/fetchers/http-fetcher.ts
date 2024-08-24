import { HttpClient } from '@angular/common/http';
import { EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';

import { DataFetcher } from '../data-fetching.service';

export type HttpFetcherConfigs = {
  endpoint: string;
  method: string;
  body?: string;
  headers?: Record<string, string>;
};

const httpFetcher: DataFetcher<HttpFetcherConfigs> = (configs: HttpFetcherConfigs) => {
  const { endpoint, method, headers, body } = configs;
  const httpClient = inject(HttpClient);

  return httpClient.request(method, endpoint, {
    headers,
    body,
  });
};

export const getHttpFetcher =
  (injector: EnvironmentInjector): DataFetcher<HttpFetcherConfigs> =>
  (configs: HttpFetcherConfigs) =>
    runInInjectionContext(injector, () => httpFetcher(configs));
