import { inject, Injectable } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, tap } from 'rxjs';

import { EmptyObject, UIElementTemplate } from '../interfaces';
import { logInfo } from '../utils/logging';
import { EventsService } from './events.service';
import { InterpolationService } from './interpolation.service';

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplatesService {
  test = inject(InterpolationService);
  #eventsService: EventsService = inject(EventsService);
  #uiElementTemplatesMap$: BehaviorSubject<{
    [uiElementTemplateId: string]: UIElementTemplate<ObjectType>;
  }> = new BehaviorSubject({});

  registerUIElementTemplate<T extends ObjectType = EmptyObject>(
    uiElementTemplate: UIElementTemplate<T>
  ): void {
    if (this.#uiElementTemplatesMap$.value[uiElementTemplate.id]) {
      throw new Error(
        `UI element template with id of "${uiElementTemplate.id}" has already been register. Please update it instead`
      );
    }
    this.#uiElementTemplatesMap$.next({
      ...this.#uiElementTemplatesMap$.value,
      [uiElementTemplate.id]: uiElementTemplate,
    });
  }

  updateUIElementTemplate<T extends ObjectType = EmptyObject>(
    updatedUIElementTemplate: UIElementTemplate<T>
  ): void {
    const uiElementTemplateMaps = this.#uiElementTemplatesMap$.value;

    if (!uiElementTemplateMaps[updatedUIElementTemplate.id]) {
      throw new Error(
        `UI element template with id of "${updatedUIElementTemplate.id}" has not been register. Please register it instead`
      );
    }
    this.#uiElementTemplatesMap$.next({
      ...uiElementTemplateMaps,
      [updatedUIElementTemplate.id]: updatedUIElementTemplate,
    });
  }

  getUIElementTemplate<T extends string>(id: T): Observable<UIElementTemplate> {
    return this.#uiElementTemplatesMap$.asObservable().pipe(
      distinctUntilChanged((prev, curr) => prev[id] === curr[id]),
      tap({
        next: (uiElementTemplatesMap) => {
          if (!uiElementTemplatesMap[id]) {
            this.#eventsService.emitEvent({
              type: 'MISSING_UI_ELEMENT_TEMPLATE',
              payload: {
                id,
              },
            });
          }
        },
      }),
      filter(
        (uiElementTemplatesMap): uiElementTemplatesMap is Record<T, UIElementTemplate> =>
          !!uiElementTemplatesMap[id]
      ),
      map((uiElementTemplatesMap) => {
        const uiElementTemplate = uiElementTemplatesMap[id];
        return uiElementTemplate;
      }),
      tap((val) => logInfo(`Getting ui template ${val.id}`))
    );
  }
}
