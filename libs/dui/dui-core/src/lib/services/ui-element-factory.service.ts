import { Injectable, Type } from '@angular/core';

import { BaseUIElementComponent } from '../components/base-ui-element.component';

@Injectable({
  providedIn: 'root',
})
export class UIElementFactoryService {
  #uiElementsMap: Record<string, Type<BaseUIElementComponent>> = {};

  registerUIElement(params: { type: string; component: Type<BaseUIElementComponent> }): void {
    const { type, component } = params;
    this.#uiElementsMap[type] = component;
  }

  getUIElement(type: string): Type<BaseUIElementComponent> {
    const uiElement = this.#uiElementsMap[type];

    if (!uiElement) {
      throw new Error(`${type} has not been registered as a UI Element yet!`);
    }

    return uiElement;
  }
}
