import { Injectable, Type } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UIElementFactoryService {
  #uiElementsMap: Record<string, Type<unknown>> = {};

  registerUIElement(type: string, uiElement: Type<unknown>): void {
    this.#uiElementsMap[type] = uiElement;
  }

  getUIElement(type: string): Type<unknown> {
    const uiElement = this.#uiElementsMap[type];

    if (!uiElement) {
      throw new Error(`${type} has not been registered as a UI Element yet!`);
    }

    return uiElement;
  }
}
