import { inject, Injectable } from '@angular/core';
import {
  RemoteResourceService,
  StateStoreService,
  ZodAvailableStateScope,
} from '@namnguyen191/dui-core';
import { ZodObjectType } from '@namnguyen191/types-helper';
import { z } from 'zod';

export const ZodTriggerRemoteResourceActionHook = z.strictObject(
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
export type TriggerRemoteResourceActionHook = z.infer<typeof ZodTriggerRemoteResourceActionHook>;

export const ZodAddToStateActionHook = z.strictObject(
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
export type AddToStateActionHook = z.infer<typeof ZodAddToStateActionHook>;

@Injectable({
  providedIn: 'root',
})
export class DefaultActionsHooksService {
  readonly #remoteResourceService = inject(RemoteResourceService);
  readonly #stateStoreService = inject(StateStoreService);

  handleTriggerRemoteResource = (action: TriggerRemoteResourceActionHook): void => {
    const {
      payload: { remoteResourceId },
    } = action;
    this.#remoteResourceService.triggerResource(remoteResourceId);
  };

  handleAddToState = (action: AddToStateActionHook): void => {
    this.#stateStoreService.addToState(action.payload);
  };
}
