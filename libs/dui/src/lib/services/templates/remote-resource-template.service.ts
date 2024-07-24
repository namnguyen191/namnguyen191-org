import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { ConfigWithStatus, RemoteResourceTemplate } from '../../interfaces';
import { logError } from '../../utils/logging';
import { EventsService } from '../events.service';

export type RemoteResourceTemplateWithStatus = ConfigWithStatus<RemoteResourceTemplate>;

type RemoteResourceTemplateId = string;

@Injectable({
  providedIn: 'root',
})
export class RemoteResourceTemplateService {
  #eventsService: EventsService = inject(EventsService);

  #remoteResourceTemplateMap: Record<
    RemoteResourceTemplateId,
    WritableSignal<RemoteResourceTemplateWithStatus>
  > = {};

  startRegisteringRemoteResourceTemplate(id: string): void {
    const existingRemoteResourceTemplateSig = this.#remoteResourceTemplateMap[id];
    const registeringRemoteResourceTemplate: RemoteResourceTemplateWithStatus = {
      id,
      status: 'loading',
      config: null,
    };
    if (!existingRemoteResourceTemplateSig) {
      const newRemoteResourceTemplateSig: WritableSignal<RemoteResourceTemplateWithStatus> = signal(
        registeringRemoteResourceTemplate
      );
      this.#remoteResourceTemplateMap[id] = newRemoteResourceTemplateSig;
      return;
    }

    existingRemoteResourceTemplateSig.set(registeringRemoteResourceTemplate);
  }

  registerRemoteResourceTemplate(remoteResourceTemplate: RemoteResourceTemplate): void {
    const remoteResourceTemplateId = remoteResourceTemplate.id;
    const existingRemoteResourceTemplateSig =
      this.#remoteResourceTemplateMap[remoteResourceTemplateId];
    const registeredRemoteResourceTemplate: RemoteResourceTemplateWithStatus = {
      id: remoteResourceTemplateId,
      status: 'loaded',
      config: remoteResourceTemplate,
    };
    if (existingRemoteResourceTemplateSig) {
      if (existingRemoteResourceTemplateSig().status === 'loaded') {
        logError(
          `RemoteResourceTemplate with id of "${remoteResourceTemplateId}" has already been register. Please update it instead`
        );
        return;
      }

      existingRemoteResourceTemplateSig.set(registeredRemoteResourceTemplate);
      return;
    }

    const newRemoteResourceTemplateSig: WritableSignal<RemoteResourceTemplateWithStatus> = signal(
      registeredRemoteResourceTemplate
    );

    this.#remoteResourceTemplateMap[remoteResourceTemplateId] = newRemoteResourceTemplateSig;
  }

  getRemoteResourceTemplate<T extends string>(id: T): Signal<RemoteResourceTemplateWithStatus> {
    const existingRemoteResourceTemplateSig = this.#remoteResourceTemplateMap[id];
    if (!existingRemoteResourceTemplateSig) {
      this.#eventsService.emitEvent({
        type: 'MISSING_REMOTE_RESOURCE',
        payload: {
          id,
        },
      });
      const newRemoteResourceTemplateSig: WritableSignal<RemoteResourceTemplateWithStatus> = signal(
        {
          id,
          status: 'missing',
          config: null,
        }
      );
      this.#remoteResourceTemplateMap[id] = newRemoteResourceTemplateSig;
      return newRemoteResourceTemplateSig.asReadonly();
    }
    return existingRemoteResourceTemplateSig.asReadonly();
  }

  updateRemoteResourceTemplate(updatedRemoteResourceTemplate: RemoteResourceTemplate): void {
    const updatedRemoteResourceTemplateId = updatedRemoteResourceTemplate.id;
    const existingRemoteResourceTemplateSig =
      this.#remoteResourceTemplateMap[updatedRemoteResourceTemplateId];

    if (!existingRemoteResourceTemplateSig) {
      logError(
        `RemoteResourceTemplate with id of "${updatedRemoteResourceTemplateId}" has not been register. Please register it instead`
      );
      return;
    }

    existingRemoteResourceTemplateSig.set({
      id: updatedRemoteResourceTemplateId,
      status: 'loaded',
      config: updatedRemoteResourceTemplate,
    });
  }
}
