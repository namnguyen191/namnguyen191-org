import { Injectable, Type } from '@angular/core';

import { BaseUIElementComponent } from '../components/base-ui-element.component';

export type UIElementLoader = () => Promise<Type<BaseUIElementComponent>>;

@Injectable({
  providedIn: 'root',
})
export class UIElementFactoryService {
  #uiElementsMap: Record<string, Type<BaseUIElementComponent>> = {};
  #uiElementsLoadersMap: Record<string, UIElementLoader> = {};

  registerUIElement(params: { type: string; component: Type<BaseUIElementComponent> }): void {
    const { type, component } = params;
    this.#uiElementsMap[type] = component;
  }

  registerUIElementLoader(params: { type: string; loader: UIElementLoader }): void {
    const { type, loader } = params;
    this.#uiElementsLoadersMap[type] = loader;
  }

  getUIElement(type: string): Promise<Type<BaseUIElementComponent>> {
    const uiElement = this.#uiElementsMap[type];

    if (!uiElement) {
      const loader = this.#uiElementsLoadersMap[type];
      if (loader) {
        return loader();
      }
      throw new Error(`${type} has not been registered as a UI Element yet!`);
    }

    return Promise.resolve(uiElement);
  }
}
