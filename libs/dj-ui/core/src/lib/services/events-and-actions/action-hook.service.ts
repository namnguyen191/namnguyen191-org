import { Injectable } from '@angular/core';
import { z, ZodError, ZodType } from 'zod';

export const ZodActionHook = z.object({
  type: z.string(),
  payload: z.any().optional(),
});

export type ActionHook = z.infer<typeof ZodActionHook>;

export type ActionHookHandler<T extends ActionHook['payload'] = unknown> = (payload: T) => void;
export type ActionHookPayloadParser = ZodType;

export type ActionHookHandlerAndPayloadParserMap = {
  [hookId: string]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: ActionHookHandler<any>;
    payloadParser?: ZodType;
  };
};

@Injectable({
  providedIn: 'root',
})
export class ActionHookService {
  #actionHookHandlerAndPayloadParserMap: ActionHookHandlerAndPayloadParserMap = {};

  registerHook<T>(params: {
    hookId: string;
    handler: ActionHookHandler<T>;
    payloadParser?: ZodType;
  }): void {
    const { hookId, handler, payloadParser } = params;
    const existing = this.#actionHookHandlerAndPayloadParserMap[hookId];
    if (existing) {
      console.warn(`The hook ${hookId} has already existed. Registering it again will override it`);
    }

    this.#actionHookHandlerAndPayloadParserMap[hookId] = {
      handler,
      payloadParser,
    };
  }

  registerHooks(handlersAndParsersMap: ActionHookHandlerAndPayloadParserMap): void {
    Object.entries(handlersAndParsersMap).forEach(([hookId, { handler, payloadParser }]) => {
      this.registerHook({
        hookId,
        handler,
        payloadParser,
      });
    });
  }

  triggerActionHook(hook: ActionHook): void {
    const handler = this.#actionHookHandlerAndPayloadParserMap[hook.type]?.handler;
    if (!handler) {
      console.warn(`No handler for hook ${hook.type}`);

      return;
    }

    const payloadParser = this.#actionHookHandlerAndPayloadParserMap[hook.type]?.payloadParser;
    if (payloadParser) {
      try {
        payloadParser.parse(hook.payload);
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

    handler(hook.payload);
  }

  triggerActionHooks(hooks: ActionHook[]): void {
    hooks.forEach((hook) => {
      this.triggerActionHook(hook);
    });
  }
}
