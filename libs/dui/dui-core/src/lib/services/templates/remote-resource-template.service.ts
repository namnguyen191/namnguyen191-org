import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { logError } from '../../utils/logging';
import { ActionHook } from '../events-and-actions/action-hook.service';
import { EventsService } from '../events-and-actions/events.service';
import { StateSubscriptionConfig } from '../state-store.service';
import { ConfigWithStatus } from './shared-types';

export type Request = {
  fetcherId: string;
  configs: unknown;
  interpolation?: string;
};

export type RemoteResourceTemplate = {
  id: string;
  stateSubscription?: StateSubscriptionConfig;
  options: {
    requests: Request[];
    onSuccess?: ActionHook[];
    parallel?: boolean;
  };
};

export type RemoteResourceTemplateWithStatus = ConfigWithStatus<RemoteResourceTemplate>;

type RemoteResourceTemplateId = string;

@Injectable({
  providedIn: 'root',
})
export class RemoteResourceTemplateService {
  readonly #eventsService = inject(EventsService);

  #remoteResourceTemplateSubjectMap: Record<
    RemoteResourceTemplateId,
    BehaviorSubject<RemoteResourceTemplateWithStatus>
  > = {};

  startRegisteringRemoteResourceTemplate(id: string): void {
    const existingRemoteResourceTemplateSubject = this.#remoteResourceTemplateSubjectMap[id];
    const registeringRemoteResourceTemplate: RemoteResourceTemplateWithStatus = {
      id,
      status: 'loading',
      config: null,
    };
    if (!existingRemoteResourceTemplateSubject) {
      const newRemoteResourceTemplateSubject =
        new BehaviorSubject<RemoteResourceTemplateWithStatus>(registeringRemoteResourceTemplate);
      this.#remoteResourceTemplateSubjectMap[id] = newRemoteResourceTemplateSubject;
      return;
    }

    existingRemoteResourceTemplateSubject.next(registeringRemoteResourceTemplate);
  }

  registerRemoteResourceTemplate(remoteResourceTemplate: RemoteResourceTemplate): void {
    const remoteResourceTemplateId = remoteResourceTemplate.id;
    const existingRemoteResourceTemplateSubject =
      this.#remoteResourceTemplateSubjectMap[remoteResourceTemplateId];
    const registeredRemoteResourceTemplate: RemoteResourceTemplateWithStatus = {
      id: remoteResourceTemplateId,
      status: 'loaded',
      config: remoteResourceTemplate,
    };
    if (existingRemoteResourceTemplateSubject) {
      if (existingRemoteResourceTemplateSubject.getValue().status === 'loaded') {
        logError(
          `RemoteResourceTemplate with id of "${remoteResourceTemplateId}" has already been register. Please update it instead`
        );
        return;
      }

      existingRemoteResourceTemplateSubject.next(registeredRemoteResourceTemplate);
      return;
    }

    const newRemoteResourceTemplateSubject = new BehaviorSubject<RemoteResourceTemplateWithStatus>(
      registeredRemoteResourceTemplate
    );

    this.#remoteResourceTemplateSubjectMap[remoteResourceTemplateId] =
      newRemoteResourceTemplateSubject;
  }

  getRemoteResourceTemplate<T extends string>(id: T): Observable<RemoteResourceTemplateWithStatus> {
    const existingRemoteResourceTemplateSubject = this.#remoteResourceTemplateSubjectMap[id];
    if (!existingRemoteResourceTemplateSubject) {
      this.#eventsService.emitEvent({
        type: 'MISSING_REMOTE_RESOURCE_TEMPLATE',
        payload: {
          id,
        },
      });
      const newRemoteResourceTemplateSubject =
        new BehaviorSubject<RemoteResourceTemplateWithStatus>({
          id,
          status: 'missing',
          config: null,
        });
      this.#remoteResourceTemplateSubjectMap[id] = newRemoteResourceTemplateSubject;
      return newRemoteResourceTemplateSubject.asObservable();
    }
    return existingRemoteResourceTemplateSubject.asObservable();
  }

  updateRemoteResourceTemplate(updatedRemoteResourceTemplate: RemoteResourceTemplate): void {
    const updatedRemoteResourceTemplateId = updatedRemoteResourceTemplate.id;
    const existingRemoteResourceTemplateSubject =
      this.#remoteResourceTemplateSubjectMap[updatedRemoteResourceTemplateId];

    if (!existingRemoteResourceTemplateSubject) {
      logError(
        `RemoteResourceTemplate with id of "${updatedRemoteResourceTemplateId}" has not been register. Please register it instead`
      );
      return;
    }

    existingRemoteResourceTemplateSubject.next({
      id: updatedRemoteResourceTemplateId,
      status: 'loaded',
      config: updatedRemoteResourceTemplate,
    });
  }
}
