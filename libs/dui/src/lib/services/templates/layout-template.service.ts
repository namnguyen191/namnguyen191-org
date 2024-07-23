import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { ConfigWithStatus, LayoutTemplate } from '../../interfaces';
import { logError } from '../../utils/logging';
import { EventsService } from '../events.service';

export type LayoutTemplateWithStatus = ConfigWithStatus<LayoutTemplate>;

type LayoutTemplateId = string;

@Injectable({
  providedIn: 'root',
})
export class LayoutTemplateService {
  #eventsService: EventsService = inject(EventsService);

  #layoutMap: Record<LayoutTemplateId, WritableSignal<LayoutTemplateWithStatus>> = {};

  startRegisteringLayoutTemplate(id: string): void {
    const existingLayoutTemplateSig = this.#layoutMap[id];
    const registeringLayoutTemplate: LayoutTemplateWithStatus = {
      id,
      status: 'loading',
      config: null,
    };
    if (!existingLayoutTemplateSig) {
      const newLayoutTemplateSig: WritableSignal<LayoutTemplateWithStatus> =
        signal(registeringLayoutTemplate);
      this.#layoutMap[id] = newLayoutTemplateSig;
      return;
    }

    existingLayoutTemplateSig.set(registeringLayoutTemplate);
  }

  registerLayoutTemplate(layout: LayoutTemplate): void {
    const layoutId = layout.id;
    const existingLayoutTemplateSig = this.#layoutMap[layoutId];
    const registeredLayoutTemplate: LayoutTemplateWithStatus = {
      id: layoutId,
      status: 'loaded',
      config: layout,
    };
    if (existingLayoutTemplateSig) {
      if (existingLayoutTemplateSig().status === 'loaded') {
        logError(
          `LayoutTemplate with id of "${layoutId}" has already been register. Please update it instead`
        );
        return;
      }

      existingLayoutTemplateSig.set(registeredLayoutTemplate);
      return;
    }

    const newLayoutTemplateSig: WritableSignal<LayoutTemplateWithStatus> =
      signal(registeredLayoutTemplate);

    this.#layoutMap[layoutId] = newLayoutTemplateSig;
  }

  getLayoutTemplate<T extends string>(id: T): Signal<LayoutTemplateWithStatus> {
    const existingLayoutTemplateSig = this.#layoutMap[id];
    if (!existingLayoutTemplateSig) {
      this.#eventsService.emitEvent({
        type: 'MISSING_LAYOUT',
        payload: {
          id,
        },
      });
      const newLayoutTemplateSig: WritableSignal<LayoutTemplateWithStatus> = signal({
        id,
        status: 'missing',
        config: null,
      });
      this.#layoutMap[id] = newLayoutTemplateSig;
      return newLayoutTemplateSig.asReadonly();
    }
    return existingLayoutTemplateSig.asReadonly();
  }

  updateLayoutTemplate(updatedLayoutTemplate: LayoutTemplate): void {
    const updatedLayoutTemplateId = updatedLayoutTemplate.id;
    const existingLayoutTemplateSig = this.#layoutMap[updatedLayoutTemplateId];

    if (!existingLayoutTemplateSig) {
      logError(
        `LayoutTemplate with id of "${updatedLayoutTemplateId}" has not been register. Please register it instead`
      );
      return;
    }

    existingLayoutTemplateSig.set({
      id: updatedLayoutTemplateId,
      status: 'loaded',
      config: updatedLayoutTemplate,
    });
  }
}
