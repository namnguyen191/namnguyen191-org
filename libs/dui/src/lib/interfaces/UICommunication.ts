import { z } from 'zod';

export const ZodUICommActionType = z.enum(['testAction', 'triggerRemoteResource']);

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

export const ZodUICommAction = z.discriminatedUnion('type', [
  ZodTestAction,
  ZodTriggerRemoteResourceAction,
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
