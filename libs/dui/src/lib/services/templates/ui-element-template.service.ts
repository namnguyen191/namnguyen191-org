import { inject, Injectable } from '@angular/core';
import { EmptyObject, ObjectType } from '@namnguyen191/types-helper';
import { BehaviorSubject, Observable } from 'rxjs';

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

  #uiElementTemplateSubjectMap: Record<
    UIElementTemplateId,
    BehaviorSubject<UIElementTemplateWithStatus>
  > = {};

  startRegisteringUIElementTemplate(id: string): void {
    const existingUIElementTemplateSubject = this.#uiElementTemplateSubjectMap[id];
    const registeringUIElementTemplate: UIElementTemplateWithStatus = {
      id,
      status: 'loading',
      config: null,
    };
    if (!existingUIElementTemplateSubject) {
      const newUIElementTemplateSubject = new BehaviorSubject<UIElementTemplateWithStatus>(
        registeringUIElementTemplate
      );
      this.#uiElementTemplateSubjectMap[id] = newUIElementTemplateSubject;
      return;
    }

    existingUIElementTemplateSubject.next(registeringUIElementTemplate);
  }

  registerUIElementTemplate(uiElementTemplate: UIElementTemplate): void {
    const uiElementId = uiElementTemplate.id;
    const existingUIElementTemplateSubject = this.#uiElementTemplateSubjectMap[uiElementId];
    const registeredUIElementTemplate: UIElementTemplateWithStatus = {
      id: uiElementId,
      status: 'loaded',
      config: uiElementTemplate,
    };
    if (existingUIElementTemplateSubject) {
      if (existingUIElementTemplateSubject.getValue().status === 'loaded') {
        logError(
          `UIElementTemplate with id of "${uiElementId}" has already been register. Please update it instead`
        );
        return;
      }

      existingUIElementTemplateSubject.next(registeredUIElementTemplate);
      return;
    }

    const newUIElementTemplateSubject = new BehaviorSubject<UIElementTemplateWithStatus>(
      registeredUIElementTemplate
    );

    this.#uiElementTemplateSubjectMap[uiElementId] = newUIElementTemplateSubject;
  }

  getUIElementTemplate<T extends string>(id: T): Observable<UIElementTemplateWithStatus> {
    const existingUIElementTemplateSubject = this.#uiElementTemplateSubjectMap[id];
    if (!existingUIElementTemplateSubject) {
      this.#eventsService.emitEvent({
        type: 'MISSING_UI_ELEMENT_TEMPLATE',
        payload: {
          id,
        },
      });
      const newUIElementTemplateSubject = new BehaviorSubject<UIElementTemplateWithStatus>({
        id,
        status: 'missing',
        config: null,
      });
      this.#uiElementTemplateSubjectMap[id] = newUIElementTemplateSubject;
      return newUIElementTemplateSubject.asObservable();
    }
    return existingUIElementTemplateSubject.asObservable();
  }

  updateUIElementTemplate(updatedUIElementTemplate: UIElementTemplate): void {
    const updatedUIElementTemplateId = updatedUIElementTemplate.id;
    const existingUIElementTemplateSubject =
      this.#uiElementTemplateSubjectMap[updatedUIElementTemplateId];

    if (!existingUIElementTemplateSubject) {
      logError(
        `UIElementTemplate with id of "${updatedUIElementTemplateId}" has not been register. Please register it instead`
      );
      return;
    }

    existingUIElementTemplateSubject.next({
      id: updatedUIElementTemplateId,
      status: 'loaded',
      config: updatedUIElementTemplate,
    });
  }
}
