import { EnvironmentInjector, inject } from '@angular/core';
import { z } from 'zod';

import { ZodObjectType } from '../../utils/zod-types';
import { RemoteResourceService } from '../remote-resource.service';
import { StateStoreService, ZodAvailableStateScope } from '../state-store.service';
import {
  ActionHookHandler,
  ActionHooksHandlersMap,
  ActionHooksZodParsersMap,
  createHookWithInjectionContext,
} from './action-hook.service';

const ZodDefaultActionHookType = z.enum(['triggerRemoteResource', 'addToState']);

const ZodTriggerRemoteResourceActionHook = z.strictObject(
  {
    type: z.literal(ZodDefaultActionHookType.enum.triggerRemoteResource),
    payload: z.strictObject({
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
type TriggerRemoteResourceActionHook = z.infer<typeof ZodTriggerRemoteResourceActionHook>;

const ZodAddToStateActionHook = z.strictObject(
  {
    type: z.literal(ZodDefaultActionHookType.enum.addToState),
    payload: z.strictObject({
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
type AddToStateActionHook = z.infer<typeof ZodAddToStateActionHook>;

const ZodDefaultActionHook = z.discriminatedUnion('type', [
  ZodTriggerRemoteResourceActionHook,
  ZodAddToStateActionHook,
]);

export type DefaultActionHook = z.infer<typeof ZodDefaultActionHook>;

type DefaultActionHooksHandlers = {
  [K in DefaultActionHook['type'] as `handle${Capitalize<K>}`]: ActionHookHandler<
    Extract<DefaultActionHook, { type: K }>
  >;
};

const handleTriggerRemoteResource = (action: TriggerRemoteResourceActionHook): void => {
  const {
    payload: { remoteResourceId },
  } = action;
  inject(RemoteResourceService).triggerResource(remoteResourceId);
};

const handleAddToState = (action: AddToStateActionHook): void => {
  inject(StateStoreService).addToState(action.payload);
};

export const defaultActionsHandlersMap: DefaultActionHooksHandlers = {
  handleAddToState,
  handleTriggerRemoteResource,
};

export const getDefaultActionsHooksMap = (
  injector: EnvironmentInjector
): ActionHooksHandlersMap => {
  return {
    addToState: createHookWithInjectionContext(
      injector,
      defaultActionsHandlersMap.handleAddToState
    ),
    triggerRemoteResource: createHookWithInjectionContext(
      injector,
      defaultActionsHandlersMap.handleTriggerRemoteResource
    ),
  } as ActionHooksHandlersMap;
};

export const getDefaultActionsHooksParsersMap = (): ActionHooksZodParsersMap => {
  return {
    addToState: ZodAddToStateActionHook,
    triggerRemoteResource: ZodTriggerRemoteResourceActionHook,
  } as ActionHooksZodParsersMap;
};
