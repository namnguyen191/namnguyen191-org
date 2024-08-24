import { EnvironmentInjector, Injectable, runInInjectionContext } from '@angular/core';
import { z, ZodError, ZodType } from 'zod';

export const ZodActionHook = z.object({
  type: z.string(),
  payload: z.any().optional(),
});

export type ActionHook = z.infer<typeof ZodActionHook>;

export type ActionHookHandler<T extends ActionHook = ActionHook> = (action: T) => void;

export type ActionHooksHandlersMap = { [hookId: string]: ActionHookHandler };

export const createHookWithInjectionContext = <T extends ActionHook>(
  injectionContext: EnvironmentInjector,
  hook: ActionHookHandler<T>
): ActionHookHandler<T> => {
  return (action: T): void => runInInjectionContext(injectionContext, () => hook(action));
};

export type ActionHooksZodParsersMap = { [hookType: string]: ZodType };

@Injectable({
  providedIn: 'root',
})
export class ActionHookService {
  #actionHooksHandlersMap: ActionHooksHandlersMap = {};
  #actionHooksZodParsersMap: ActionHooksZodParsersMap = {};

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

  registerHookParser(hookId: string, parser: ZodType): void {
    const existingParser = this.#actionHooksZodParsersMap[hookId];
    if (existingParser) {
      console.warn(
        `A parser has already exists for the hook ${hookId}. Registering it again will override it`
      );
    }
    this.#actionHooksZodParsersMap[hookId] = parser;
  }

  registerHookParsers(parsersMap: ActionHooksZodParsersMap): void {
    Object.entries(parsersMap).forEach(([hookId, parser]) => {
      this.registerHookParser(hookId, parser);
    });
  }

  triggerActionHook(hook: ActionHook): void {
    const handler = this.#actionHooksHandlersMap[hook.type];
    const parser = this.#actionHooksZodParsersMap[hook.type];
    if (!handler) {
      console.warn(`No handler for hook ${hook.type}`);

      return;
    }

    if (parser) {
      try {
        parser.parse(hook);
      } catch (error) {
        if (error instanceof ZodError) {
          console.warn(
            `Receiving: ${JSON.stringify(hook)} which is an invalid hook: ${error.message}`
          );
        } else {
          console.warn(
            `An unknown error has occured while trying to parse ${JSON.stringify(hook)}. Nothing will be be triggered`
          );
        }

        return;
      }
    }

    handler(hook);
  }

  triggerActionHooks(hooks: ActionHook[]): void {
    hooks.forEach((hook) => {
      this.triggerActionHook(hook);
    });
  }
}
