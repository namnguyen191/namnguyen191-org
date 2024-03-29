import { z } from 'zod';

import { ZodAvailableStateScope } from '../services/state-store.service';
import { ZodObjectType } from '../utils/zod-types';

export const ZodUICommActionType = z.enum(['testAction', 'triggerRemoteResource', 'addToState']);

export const ZodTestAction = z.object({
  type: z.literal(ZodUICommActionType.enum.testAction),
});
export type TestAction = z.infer<typeof ZodTestAction>;

export const ZodTriggerRemoteResourceAction = z.object(
  {
    type: z.literal(ZodUICommActionType.enum.triggerRemoteResource),
    payload: z.object({
      remoteResourceId: z.string(),
    }),
  },
  {
    errorMap: () => ({
      message:
        'Invalid TriggerRemoteResourceAction, example: { "type": "triggerRemoteResource", "payload": { "remoteResourceId": "123" }  } ',
    }),
  }
);
export type TriggerRemoteResourceAction = z.infer<typeof ZodTriggerRemoteResourceAction>;

export const ZodAddToStateAction = z.object(
  {
    type: z.literal(ZodUICommActionType.enum.addToState),
    payload: z.object({
      scope: ZodAvailableStateScope,
      data: ZodObjectType,
    }),
  },
  {
    errorMap: () => ({
      message:
        'Invalid AddToStateAction, example: { "type": "addToState", "payload": { "scope": "global", data: "{ "some": "data" }" }  } ',
    }),
  }
);
export type AddToStateAction = z.infer<typeof ZodAddToStateAction>;

export const ZodUICommAction = z.discriminatedUnion('type', [
  ZodTestAction,
  ZodTriggerRemoteResourceAction,
  ZodAddToStateAction,
]);

export type UICommAction = z.infer<typeof ZodUICommAction>;

export type SubscribableEvents = {
  WATCH_STATE: {
    scope: string;
    path: string;
    actionsToDispatch: UICommAction[];
  };
};

export type UICommActionHandlers = {
  [K in UICommAction['type'] as `handle${Capitalize<K>}`]: (
    action: Extract<UICommAction, { type: K }>
  ) => void;
};
