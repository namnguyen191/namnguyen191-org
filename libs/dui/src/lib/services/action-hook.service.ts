import { Injectable } from '@angular/core';

import { defaultActionHooksHandlersMap } from '../hooks';
import { ActionHook, ActionHookHandler } from '../interfaces';

export type ActionHooksHandlersMap = { [hookId: string]: ActionHookHandler };

@Injectable({
  providedIn: 'root',
})
export class ActionHookService {
  #actionHooksHandlersMap: ActionHooksHandlersMap = defaultActionHooksHandlersMap;

  registerHook(hookId: string, handler: ActionHookHandler): void {
    const existingHandler = this.#actionHooksHandlersMap[hookId];
    if (existingHandler) {
      console.warn(
        `A handler has already exists for the hook ${hookId}. Registering it again will override it`
      );
    }
    this.#actionHooksHandlersMap[hookId] = handler;
  }

  registerHooks(handlersMap: ActionHooksHandlersMap): void {
    Object.entries(handlersMap).forEach(([hookId, handler]) => {
      this.registerHook(hookId, handler);
    });
  }

  triggerActionHook(hook: ActionHook): void {
    const handler = this.#actionHooksHandlersMap[hook.type];
    if (handler) {
      handler(hook);
    }
  }

  triggerActionHooks(hooks: ActionHook[]): void {
    hooks.forEach((hook) => {
      this.triggerActionHook(hook);
    });
  }
}
