import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { logError } from '../../utils/logging';
import { EventsService } from '../events-and-actions/events.service';
import { LayoutTemplate, LayoutTemplateWithStatus } from './layout-template-interfaces';

type LayoutTemplateId = string;

@Injectable({
  providedIn: 'root',
})
export class LayoutTemplateService {
  readonly #eventsService = inject(EventsService);

  #layoutObsMap: Record<LayoutTemplateId, BehaviorSubject<LayoutTemplateWithStatus>> = {};

  startRegisteringLayoutTemplate(id: string): void {
    const existingLayoutTemplateSubject = this.#layoutObsMap[id];
    const registeringLayoutTemplate: LayoutTemplateWithStatus = {
      id,
      status: 'loading',
      config: null,
    };
    if (!existingLayoutTemplateSubject) {
      const newLayoutTemplateSubject = new BehaviorSubject<LayoutTemplateWithStatus>(
        registeringLayoutTemplate
      );
      this.#layoutObsMap[id] = newLayoutTemplateSubject;
      return;
    }

    existingLayoutTemplateSubject.next(registeringLayoutTemplate);
  }

  registerLayoutTemplate(layout: LayoutTemplate): void {
    const layoutId = layout.id;
    const existingLayoutTemplateSubject = this.#layoutObsMap[layoutId];
    const registeredLayoutTemplate: LayoutTemplateWithStatus = {
      id: layoutId,
      status: 'loaded',
      config: layout,
    };
    if (existingLayoutTemplateSubject) {
      if (existingLayoutTemplateSubject.getValue().status === 'loaded') {
        logError(
          `LayoutTemplate with id of "${layoutId}" has already been register. Please update it instead`
        );
        return;
      }

      existingLayoutTemplateSubject.next(registeredLayoutTemplate);
      return;
    }

    const newLayoutTemplateSubject = new BehaviorSubject<LayoutTemplateWithStatus>(
      registeredLayoutTemplate
    );

    this.#layoutObsMap[layoutId] = newLayoutTemplateSubject;
  }

  getLayoutTemplate<T extends string>(id: T): Observable<LayoutTemplateWithStatus> {
    const existingLayoutTemplateSubject = this.#layoutObsMap[id];
    if (!existingLayoutTemplateSubject) {
      this.#eventsService.emitEvent({
        type: 'MISSING_LAYOUT_TEMPLATE',
        payload: {
          id,
        },
      });
      const newLayoutTemplateSubject = new BehaviorSubject<LayoutTemplateWithStatus>({
        id,
        status: 'missing',
        config: null,
      });
      this.#layoutObsMap[id] = newLayoutTemplateSubject;
      return newLayoutTemplateSubject.asObservable();
    }
    return existingLayoutTemplateSubject.asObservable();
  }

  updateLayoutTemplate(updatedLayoutTemplate: LayoutTemplate): void {
    const updatedLayoutTemplateId = updatedLayoutTemplate.id;
    const existingLayoutTemplateSubject = this.#layoutObsMap[updatedLayoutTemplateId];

    if (!existingLayoutTemplateSubject) {
      logError(
        `LayoutTemplate with id of "${updatedLayoutTemplateId}" has not been register. Please register it instead`
      );
      return;
    }

    existingLayoutTemplateSubject.next({
      id: updatedLayoutTemplateId,
      status: 'loaded',
      config: updatedLayoutTemplate,
    });
  }
}
