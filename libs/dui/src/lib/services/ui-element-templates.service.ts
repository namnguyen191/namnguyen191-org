import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { ConfigWithStatus, UIElementTemplate } from '../interfaces';
import { logError } from '../utils/logging';

export type UIElementTemplateConfigWithStatus = ConfigWithStatus<UIElementTemplate>;

type UIElementTemplateId = string;

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplatesService {
  #uiElementTemplateMap: Record<
    UIElementTemplateId,
    WritableSignal<UIElementTemplateConfigWithStatus>
  > = {};

  startRegisteringUIElementTemplate(id: string): void {
    const existingUIElementTemplateSig = this.#uiElementTemplateMap[id];
    const registeringUIElementTemplate: UIElementTemplateConfigWithStatus = {
      id,
      status: 'loading',
      config: null,
    };
    if (!existingUIElementTemplateSig) {
      const newUIElementTemplateSig: WritableSignal<UIElementTemplateConfigWithStatus> = signal(
        registeringUIElementTemplate
      );
      this.#uiElementTemplateMap[id] = newUIElementTemplateSig;
      return;
    }

    existingUIElementTemplateSig.set(registeringUIElementTemplate);
  }

  registerUIElementTemplate(uiElementTemplate: UIElementTemplate): void {
    const uiElementId = uiElementTemplate.id;
    const existingUIElementTemplateSig = this.#uiElementTemplateMap[uiElementId];
    const registeredUIElementTemplate: UIElementTemplateConfigWithStatus = {
      id: uiElementId,
      status: 'loaded',
      config: uiElementTemplate,
    };
    if (existingUIElementTemplateSig) {
      if (existingUIElementTemplateSig().status === 'loaded') {
        logError(
          `UIElementTemplate with id of "${uiElementId}" has already been register. Please update it instead`
        );
        return;
      }

      existingUIElementTemplateSig.set(registeredUIElementTemplate);
      return;
    }

    const newUIElementTemplateSig: WritableSignal<UIElementTemplateConfigWithStatus> = signal(
      registeredUIElementTemplate
    );

    this.#uiElementTemplateMap[uiElementId] = newUIElementTemplateSig;
  }

  getUIElementTemplate<T extends string>(id: T): Signal<UIElementTemplateConfigWithStatus> {
    const existingUIElementTemplateSig = this.#uiElementTemplateMap[id];
    if (!existingUIElementTemplateSig) {
      const newUIElementTemplateSig: WritableSignal<UIElementTemplateConfigWithStatus> = signal({
        id,
        status: 'missing',
        config: null,
      });
      this.#uiElementTemplateMap[id] = newUIElementTemplateSig;
      return newUIElementTemplateSig.asReadonly();
    }
    return existingUIElementTemplateSig.asReadonly();
  }

  updateUIElementTemplate(updatedUIElementTemplate: UIElementTemplate): void {
    const updatedUIElementTemplateId = updatedUIElementTemplate.id;
    const existingUIElementTemplateSig = this.#uiElementTemplateMap[updatedUIElementTemplateId];

    if (!existingUIElementTemplateSig) {
      logError(
        `UIElementTemplate with id of "${updatedUIElementTemplateId}" has not been register. Please register it instead`
      );
      return;
    }

    existingUIElementTemplateSig.set({
      id: updatedUIElementTemplateId,
      status: 'loaded',
      config: updatedUIElementTemplate,
    });
  }
}
