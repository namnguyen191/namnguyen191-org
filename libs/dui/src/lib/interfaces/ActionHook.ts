import { z } from 'zod';

import { ZodAvailableStateScope } from '../services/state-store.service';
import { ZodObjectType } from '../utils/zod-types';

export const ZodActionHook = z.object({
  type: z.string(),
  payload: z.any().optional(),
});

export type ActionHook = z.infer<typeof ZodActionHook>;

export type ActionHookHandler<T extends ActionHook = ActionHook> = (action: T) => void;

export const ZodDefaultActionHookType = z.enum(['triggerRemoteResource', 'addToState']);

export const ZodTriggerRemoteResourceActionHook = z.object(
  {
    type: z.literal(ZodDefaultActionHookType.enum.triggerRemoteResource),
    payload: z.object({
      remoteResourceId: z.string(),
    }),
  },
  {
    errorMap: () => ({
      message:
        'Invalid TriggerRemoteResourceActionHook, example: { "type": "triggerRemoteResource", "payload": { "remoteResourceId": "123" }  } ',
    }),
  }
);
export type TriggerRemoteResourceActionHook = z.infer<typeof ZodTriggerRemoteResourceActionHook>;

export const ZodAddToStateActionHook = z.object(
  {
    type: z.literal(ZodDefaultActionHookType.enum.addToState),
    payload: z.object({
      scope: ZodAvailableStateScope,
      data: ZodObjectType,
    }),
  },
  {
    errorMap: () => ({
      message:
        'Invalid AddToStateActionHook, example: { "type": "addToState", "payload": { "scope": "global", data: "{ "some": "data" }" }  } ',
    }),
  }
);
export type AddToStateActionHook = z.infer<typeof ZodAddToStateActionHook>;

export const ZodDefaultActionHook = z.discriminatedUnion('type', [
  ZodTriggerRemoteResourceActionHook,
  ZodAddToStateActionHook,
]);

export type DefaultActionHook = z.infer<typeof ZodDefaultActionHook>;

export type DefaultActionHooksHandlers = {
  [K in DefaultActionHook['type'] as `handle${Capitalize<K>}`]: ActionHookHandler<
    Extract<DefaultActionHook, { type: K }>
  >;
};
