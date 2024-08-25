import { EnvironmentInjector, inject } from '@angular/core';
import {
  ActionHooksHandlersMap,
  ActionHooksZodParsersMap,
  createHookWithInjectionContext,
  RemoteResourceService,
  StateStoreService,
  ZodAvailableStateScope,
} from '@namnguyen191/dui-core';
import { ZodObjectType } from '@namnguyen191/types-helper';
import { z } from 'zod';

const ZodTriggerRemoteResourceActionHook = z.strictObject(
  {
    type: z.literal('triggerRemoteResource'),
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
    type: z.literal('addToState'),
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

const handleTriggerRemoteResource = (action: TriggerRemoteResourceActionHook): void => {
  const {
    payload: { remoteResourceId },
  } = action;
  inject(RemoteResourceService).triggerResource(remoteResourceId);
};

const handleAddToState = (action: AddToStateActionHook): void => {
  inject(StateStoreService).addToState(action.payload);
};

export const defaultActionsHandlersMap = {
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
