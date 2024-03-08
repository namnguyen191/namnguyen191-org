import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, filter, map, Observable, tap } from 'rxjs';

import { UIElementTemplate } from '../interfaces';
import { logInfo } from '../utils/logging';
import { EventsService } from './events.service';

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplatesService {
  #eventsService: EventsService = inject(EventsService);
  #uiElementTemplatesMap$: BehaviorSubject<{
    [uiElementTemplateId: string]: UIElementTemplate;
  }> = new BehaviorSubject({});

  registerUIElementTemplate(uiElementTemplate: UIElementTemplate): void {
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

  updateUIElementTemplate(updatedUIElementTemplate: UIElementTemplate): void {
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

  // getUIElementOption(params: { id: string; optionName: string }): UIElementTemplate {
  //   const { id, optionName } = params;
  //   const uiElementTemplate = this.#uiElementTemplatesMap[id];

  //   if (!uiElementTemplate) {
  //     throw new Error(`${id} has not been registered as a UI Element template yet!`);
  //   }

  //   return uiElementTemplate;
  // }
}
