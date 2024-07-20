import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { LayoutConfig, RenderStatus } from '../interfaces';
import { logError } from '../utils/logging';
import { EventsService } from './events.service';

export type LayoutWithStatus = {
  id: string;
} & (
  | {
      config: null;
      status: Exclude<RenderStatus, 'loaded'>;
    }
  | {
      config: LayoutConfig;
      status: Extract<RenderStatus, 'loaded'>;
    }
);

type LayoutId = string;

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  #layoutMap: Record<LayoutId, WritableSignal<LayoutWithStatus>> = {};
  #eventsService: EventsService = inject(EventsService);

  startRegisteringLayout(id: string): void {
    const existingLayoutSig = this.#layoutMap[id];
    console.log('Nam data is: registering layout', existingLayoutSig);
    const registeringLayout: LayoutWithStatus = {
      id,
      status: 'loading',
      config: null,
    };
    if (!existingLayoutSig) {
      const newLayoutSig: WritableSignal<LayoutWithStatus> = signal(registeringLayout);
      this.#layoutMap[id] = newLayoutSig;
      return;
    }

    existingLayoutSig.set(registeringLayout);
  }

  registerLayout(layout: LayoutConfig): void {
    const layoutId = layout.id;
    const existingLayoutSig = this.#layoutMap[layoutId];
    const registeredLayout: LayoutWithStatus = {
      id: layoutId,
      status: 'loaded',
      config: layout,
    };
    if (existingLayoutSig) {
      if (existingLayoutSig().status === 'loaded') {
        logError(
          `Layout with id of "${layoutId}" has already been register. Please update it instead`
        );
        return;
      }

      existingLayoutSig.set(registeredLayout);
      return;
    }

    const newLayoutSig: WritableSignal<LayoutWithStatus> = signal(registeredLayout);

    this.#layoutMap[layoutId] = newLayoutSig;
  }

  getLayout<T extends string>(id: T): Signal<LayoutWithStatus> {
    const existingLayoutSig = this.#layoutMap[id];
    if (!existingLayoutSig) {
      const newLayoutSig: WritableSignal<LayoutWithStatus> = signal({
        id,
        status: 'missing',
        config: null,
      });
      this.#layoutMap[id] = newLayoutSig;
      return newLayoutSig.asReadonly();
    }
    return existingLayoutSig.asReadonly();
  }

  updateLayout(updatedLayout: LayoutConfig): void {
    const updatedLayoutId = updatedLayout.id;
    const existingLayoutSig = this.#layoutMap[updatedLayoutId];

    if (!existingLayoutSig) {
      logError(
        `Layout with id of "${updatedLayoutId}" has not been register. Please register it instead`
      );
      return;
    }

    existingLayoutSig.set({
      id: updatedLayoutId,
      status: 'loaded',
      config: updatedLayout,
    });
  }
}
