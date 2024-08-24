import { Injectable } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { Observable } from 'rxjs';

import { logError, logWarning } from '../utils/logging';

export type DataFetcher<TOptions extends ObjectType = ObjectType, TReturn = unknown> = (
  options: TOptions
) => Observable<TReturn>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyDataFetcher = DataFetcher<any, any>;

@Injectable({
  providedIn: 'root',
})
export class DataFetchingService {
  readonly #fetcherMap: { [id: string]: DataFetcher } = {};

  registerFetcher(id: string, fetcher: AnyDataFetcher): void {
    const existingFetcher = this.#fetcherMap[id];
    if (existingFetcher) {
      logWarning(`Fetcher with id ${id} already exists. Registering it again will override it`);
    }

    this.#fetcherMap[id] = fetcher;
  }

  registerFetchers(fetcherMap: { [id: string]: AnyDataFetcher }): void {
    for (const [id, fetcher] of Object.entries(fetcherMap)) {
      this.registerFetcher(id, fetcher);
    }
  }

  getFetcher(id: string): DataFetcher {
    const existingFetcher = this.#fetcherMap[id];
    if (!existingFetcher) {
      const errorMsg = `Fetcher with id ${id} does not exists. Please register it first`;
      logError(errorMsg);
      throw new Error(errorMsg);
    }
    return existingFetcher;
  }

  fetchData(fetcherId: string, configs: ObjectType): Observable<unknown> {
    const existingFetcher = this.getFetcher(fetcherId);

    return existingFetcher(configs);
  }
}
