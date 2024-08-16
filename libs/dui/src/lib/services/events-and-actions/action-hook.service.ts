import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import { z } from 'zod';

import { ZodInterpolationString } from '../interpolation.service';

export const ZodActionHook = z.object({
  type: z.string(),
  payload: z.any().optional(),
});

export type ActionHook = z.infer<typeof ZodActionHook>;

export type ActionHookHandler<T extends ActionHook = ActionHook> = (action: T) => void;

export const ZodContextBasedActionHooks = z.union([ZodInterpolationString, z.array(ZodActionHook)]);

export type ContextBasedActionHooks = z.infer<typeof ZodContextBasedActionHooks>;

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
  #actionHooksHandlersMap: ActionHooksHandlersMap = {};

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
