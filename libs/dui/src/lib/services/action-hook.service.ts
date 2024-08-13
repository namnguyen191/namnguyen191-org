import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';

import { actionsHandlersMap } from '../hooks';
import { ActionHook, ActionHookHandler } from '../interfaces';

export type ActionHooksHandlersMap = { [hookId: string]: ActionHookHandler };

export const createHookWithInjectionContext = <T extends ActionHook>(
  injectionContext: EnvironmentInjector,
  hook: ActionHookHandler<T>
): ActionHookHandler<T> => {
  return (action: T): void => runInInjectionContext(injectionContext, () => hook(action));
};

@Injectable({
  providedIn: 'root',
})
export class ActionHookService {
  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  #actionHooksHandlersMap: ActionHooksHandlersMap = {
    triggerRemoteResource: createHookWithInjectionContext(
      this.#environmentInjector,
      actionsHandlersMap.handleTriggerRemoteResource
    ),
    addToState: createHookWithInjectionContext(
      this.#environmentInjector,
      actionsHandlersMap.handleAddToState
    ),
  } as ActionHooksHandlersMap;

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
