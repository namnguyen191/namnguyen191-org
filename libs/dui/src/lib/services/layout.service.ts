import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, tap } from 'rxjs';

import { LayoutConfig } from '../interfaces';
import { logInfo } from '../utils/logging';
import { EventsService } from './events.service';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  #layoutMap$: BehaviorSubject<Record<string, LayoutConfig>> = new BehaviorSubject({});
  #eventsService: EventsService = inject(EventsService);

  registerLayout(layout: LayoutConfig): void {
    const layoutId = layout.id;
    if (this.#layoutMap$.value[layoutId]) {
      throw new Error(
        `Layout with id of "${layoutId}" has already been register. Please update it instead`
      );
    }

    this.#layoutMap$.next({
      ...this.#layoutMap$.value,
      [layoutId]: layout,
    });
  }

  getLayout<T extends string>(id: T): Observable<LayoutConfig> {
    return this.#layoutMap$.asObservable().pipe(
      distinctUntilChanged((prev, curr) => prev[id] === curr[id]),
      tap({
        next: (layoutMap) => {
          if (!layoutMap[id]) {
            this.#eventsService.emitEvent({
              type: 'MISSING_LAYOUT',
              payload: {
                id,
              },
            });
          }
        },
      }),
      filter((layoutMap): layoutMap is Record<T, LayoutConfig> => !!layoutMap[id]),
      map((layoutMap) => {
        const layout = layoutMap[id];
        return layout;
      }),
      tap((val) => logInfo(`Getting layout ${val.id}`))
    );
  }

  updateLayout(updatedLayout: LayoutConfig): void {
    const updatedLayoutId = updatedLayout.id;
    const layoutMap = this.#layoutMap$.value;

    if (!layoutMap[updatedLayout.id]) {
      throw new Error(
        `Layout with id of "${updatedLayoutId}" has not been register. Please register it instead`
      );
    }
    this.#layoutMap$.next({
      ...layoutMap,
      [updatedLayoutId]: updatedLayout,
    });
  }
}
