import { Injectable } from '@angular/core';

import { BaseUIElementComponent } from '../ui-elemements';

@Injectable({
  providedIn: 'root',
})
export class UIElementFactoryService {
  #uiElementsMap: Record<string, typeof BaseUIElementComponent> = {};

  registerUIElement(type: string, uiElement: typeof BaseUIElementComponent): void {
    this.#uiElementsMap[type] = uiElement;
  }

  getUIElement(type: string): typeof BaseUIElementComponent {
    const uiElement = this.#uiElementsMap[type];

    if (!uiElement) {
      throw new Error(`${type} has not been registered as a UI Element yet!`);
    }

    return uiElement;
  }
}
