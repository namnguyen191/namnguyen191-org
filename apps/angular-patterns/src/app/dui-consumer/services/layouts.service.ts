import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LayoutTemplate, UIElementPositionAndSize } from '@namnguyen191/dui';
import { Observable, of, shareReplay, switchMap, tap } from 'rxjs';

const BASE_LAYOUT_URL = 'http://localhost:8080/layouts';

@Injectable({
  providedIn: 'root',
})
export class LayoutsService {
  #httpClient: HttpClient = inject(HttpClient);

  #layoutsCache: Record<string, Observable<LayoutTemplate>> = {};

  getLayoutById(id: string): Observable<LayoutTemplate> {
    let layout$ = this.#layoutsCache[id];
    if (!layout$) {
      layout$ = this.#fetchLayoutById(id).pipe(shareReplay(1));
      this.#layoutsCache[id] = layout$;
    }

    return layout$;
  }

  updateLayout(updatedLayout: LayoutTemplate): Observable<void> {
    return this.#httpClient
      .put<void>(BASE_LAYOUT_URL, updatedLayout)
      .pipe(tap(() => (this.#layoutsCache[updatedLayout.id] = of(updatedLayout))));
  }

  updateLayoutElementPositionAndSize(
    layoutId: string,
    elementsWithNewPosAndSize: Record<string, UIElementPositionAndSize>
  ): Observable<void> {
    const layoutInCache$ = this.#layoutsCache[layoutId];
    if (!layoutInCache$) {
      throw new Error(
        `Failed to update element pos and size because layout ${layoutId} does not exist in the cache`
      );
    }
    return layoutInCache$.pipe(
      switchMap((layout) => {
        const allEleInLayout = layout.uiElementInstances;
        Object.entries(elementsWithNewPosAndSize).forEach(([elementId, newPosAndSize]) => {
          const foundEle = allEleInLayout.find((ele) => ele.id === elementId);
          if (!foundEle) {
            throw new Error(`Cannot find element with id ${elementId}`);
          }

          foundEle.positionAndSize = newPosAndSize;
        });
        return this.updateLayout(layout);
      })
    );
  }

  #fetchLayoutById(id: string): Observable<LayoutTemplate> {
    return this.#httpClient.get<LayoutTemplate>(`${BASE_LAYOUT_URL}/${id}`);
  }
}
