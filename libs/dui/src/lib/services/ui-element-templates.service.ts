import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { UIElementTemplate } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplatesService {
  #uiElementTemplatesMap: Record<string, WritableSignal<UIElementTemplate | null>> = {};

  registerUIElementTemplate(uiElementTemplate: UIElementTemplate): void {
    const uiElementTemplateSignal = this.#uiElementTemplatesMap[uiElementTemplate.id];
    if (uiElementTemplateSignal) {
      uiElementTemplateSignal.set(uiElementTemplate);
      return;
    }

    this.#uiElementTemplatesMap[uiElementTemplate.id] = signal(uiElementTemplate);
  }

  getUIElementTemplate(id: string): Signal<UIElementTemplate | null> {
    const uiElementTemplateSignal = this.#uiElementTemplatesMap[id];

    if (uiElementTemplateSignal) {
      return uiElementTemplateSignal.asReadonly();
    }

    console.warn(`${id} has not been registered as a UI Element template yet!`);
    const newUIElementTemplateSignal = signal(null);
    this.#uiElementTemplatesMap[id] = newUIElementTemplateSignal;
    return newUIElementTemplateSignal.asReadonly();
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
