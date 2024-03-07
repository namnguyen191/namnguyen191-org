import { inject, Injectable } from '@angular/core';
import { asyncScheduler, BehaviorSubject, Observable } from 'rxjs';

import { UIElementTemplate } from '../interfaces';
import { EventsService } from './events.service';

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplatesService {
  #eventsService: EventsService = inject(EventsService);
  #uiElementTemplatesMap$: Record<string, BehaviorSubject<UIElementTemplate | null>> = {};

  registerUIElementTemplate(uiElementTemplate: UIElementTemplate): void {
    const uiElementTemplate$ = this.#uiElementTemplatesMap$[uiElementTemplate.id];
    if (uiElementTemplate$) {
      uiElementTemplate$.next(uiElementTemplate);
      return;
    }

    this.#uiElementTemplatesMap$[uiElementTemplate.id] =
      new BehaviorSubject<UIElementTemplate | null>(uiElementTemplate);
  }

  updateUIElementTemplate(updatedUIElementTemplate: UIElementTemplate): void {
    const uiElementTemplate$ = this.#uiElementTemplatesMap$[updatedUIElementTemplate.id];
    if (uiElementTemplate$) {
      const old = uiElementTemplate$.getValue();
      if (old) {
        uiElementTemplate$.next(updatedUIElementTemplate);
      }
    }
  }

  getUIElementTemplate(id: string): Observable<UIElementTemplate | null> {
    const uiElementTemplate$ = this.#uiElementTemplatesMap$[id];

    if (uiElementTemplate$) {
      return uiElementTemplate$.asObservable();
    }
    console.log('Nam data is: getting', id);
    asyncScheduler.schedule(() => {
      console.warn(`${id} has not been registered as a UI Element template yet!`);

      this.#eventsService.emitEvent({
        type: 'MISSING_UI_ELEMENT_TEMPLATE',
        payload: {
          id,
        },
      });
    });
    const newUIElementTemplate$ = new BehaviorSubject<UIElementTemplate | null>(null);
    this.#uiElementTemplatesMap$[id] = newUIElementTemplate$;
    return newUIElementTemplate$.asObservable();
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
