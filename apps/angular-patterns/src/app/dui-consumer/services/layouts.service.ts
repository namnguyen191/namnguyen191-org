import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LayoutConfig } from '@namnguyen191/dui';
import { Observable, shareReplay } from 'rxjs';

const BASE_LAYOUT_URL = 'http://localhost:8080/layouts';

@Injectable({
  providedIn: 'root',
})
export class LayoutsService {
  #httpClient: HttpClient = inject(HttpClient);

  #layoutsCache: Record<string, Observable<LayoutConfig>> = {};

  getLayoutById(id: string): Observable<LayoutConfig> {
    let layout$ = this.#layoutsCache[id];
    if (!layout$) {
      layout$ = this.#fetchLayoutById(id).pipe(shareReplay(1));
      this.#layoutsCache[id] = layout$;
    }

    return layout$;
  }

  #fetchLayoutById(id: string): Observable<LayoutConfig> {
    return this.#httpClient.get<LayoutConfig>(`${BASE_LAYOUT_URL}/${id}`);
  }
}
