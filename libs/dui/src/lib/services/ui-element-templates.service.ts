import { Injectable } from '@angular/core';

import { UIElementTemplate } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplatesService {
  #uiElementTemplatesMap: Record<string, UIElementTemplate> = {};

  registerUIElementTemplate(uiElementTemplate: UIElementTemplate): void {
    this.#uiElementTemplatesMap[uiElementTemplate.id] = uiElementTemplate;
  }

  getUIElement(id: string): UIElementTemplate {
    const uiElementTemplate = this.#uiElementTemplatesMap[id];

    if (!uiElementTemplate) {
      throw new Error(`${id} has not been registered as a UI Element template yet!`);
    }

    return uiElementTemplate;
  }
}
