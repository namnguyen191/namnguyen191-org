import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { EmptyObject, ObjectType } from '@namnguyen191/types-helper';

import { UIElementRequiredConfigs } from '../../components/base-ui-element.component';
import { logError } from '../../utils/logging';
import { EventsService } from '../events-and-actions/events.service';
import { StateSubscriptionConfig } from '../state-store.service';
import { ConfigWithStatus } from './shared-types';

export type UIElementTemplateOptions<T extends ObjectType = EmptyObject> =
  Partial<UIElementRequiredConfigs> & T;

export type UIElementTemplate<T extends ObjectType = EmptyObject> = {
  id: string;
  type: string;
  remoteResourceIds?: string[];
  stateSubscription?: StateSubscriptionConfig;
  options: UIElementTemplateOptions<T>;
};

export type UIElementTemplateWithStatus = ConfigWithStatus<UIElementTemplate>;

type UIElementTemplateId = string;

@Injectable({
  providedIn: 'root',
})
export class UIElementTemplateService {
  readonly #eventsService = inject(EventsService);

  #uiElementTemplateMap: Record<UIElementTemplateId, WritableSignal<UIElementTemplateWithStatus>> =
    {};

  startRegisteringUIElementTemplate(id: string): void {
    const existingUIElementTemplateSig = this.#uiElementTemplateMap[id];
    const registeringUIElementTemplate: UIElementTemplateWithStatus = {
      id,
      status: 'loading',
      config: null,
    };
    if (!existingUIElementTemplateSig) {
      const newUIElementTemplateSig: WritableSignal<UIElementTemplateWithStatus> = signal(
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
    const registeredUIElementTemplate: UIElementTemplateWithStatus = {
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

    const newUIElementTemplateSig: WritableSignal<UIElementTemplateWithStatus> = signal(
      registeredUIElementTemplate
    );

    this.#uiElementTemplateMap[uiElementId] = newUIElementTemplateSig;
  }

  getUIElementTemplate<T extends string>(id: T): Signal<UIElementTemplateWithStatus> {
    const existingUIElementTemplateSig = this.#uiElementTemplateMap[id];
    if (!existingUIElementTemplateSig) {
      this.#eventsService.emitEvent({
        type: 'MISSING_UI_ELEMENT_TEMPLATE',
        payload: {
          id,
        },
      });
      const newUIElementTemplateSig: WritableSignal<UIElementTemplateWithStatus> = signal({
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
