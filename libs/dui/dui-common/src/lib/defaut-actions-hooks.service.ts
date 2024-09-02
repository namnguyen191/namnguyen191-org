import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionHookHandler,
  RemoteResourceService,
  StateStoreService,
  ZodAvailableStateScope,
} from '@namnguyen191/dui-core';
import { ZodObjectType } from '@namnguyen191/types-helper';
import { z } from 'zod';

export const ZTriggerRemoteResourceHookPayload = z.strictObject(
  {
    remoteResourceId: z.string(),
  },
  {
    errorMap: () => ({
      message:
        'Invalid triggerRemoteResource action hook payload, example: { "type": "triggerRemoteResource", "payload": { "remoteResourceId": "123" }  } ',
    }),
  }
);
export type TriggerRemoteResourceHookPayload = z.infer<typeof ZTriggerRemoteResourceHookPayload>;

export const ZAddToStateActionHookPayload = z.strictObject(
  {
    scope: ZodAvailableStateScope,
    data: ZodObjectType,
  },
  {
    errorMap: () => ({
      message:
        'Invalid addToState action hook payload, example: { "type": "addToState", "payload": { "scope": "global", data: "{ "some": "data" }" }  } ',
    }),
  }
);
export type AddToStateActionHookPayload = z.infer<typeof ZAddToStateActionHookPayload>;

export const ZNavigateHookPayload = z.strictObject(
  {
    navigationType: z.union([z.literal('internal'), z.literal('external')]),
    url: z.string(),
  },
  {
    errorMap: () => ({
      message:
        'Invalid navigate action hook payload, example: { "type": "navigate", "payload": { "navigationType": "internal", url: "/my/route" }  } ',
    }),
  }
);
export type NavigateHookPayload = z.infer<typeof ZNavigateHookPayload>;

@Injectable({
  providedIn: 'root',
})
export class DefaultActionsHooksService {
  readonly #remoteResourceService = inject(RemoteResourceService);
  readonly #stateStoreService = inject(StateStoreService);
  readonly #router = inject(Router);

  handleTriggerRemoteResource: ActionHookHandler<TriggerRemoteResourceHookPayload> = ({
    remoteResourceId,
  }): void => {
    this.#remoteResourceService.triggerResource(remoteResourceId);
  };

  handleAddToState: ActionHookHandler<AddToStateActionHookPayload> = (payload): void => {
    this.#stateStoreService.addToState(payload);
  };

  navigate: ActionHookHandler<NavigateHookPayload> = ({ navigationType, url }) => {
    if (navigationType === 'internal') {
      this.#router.navigateByUrl(url);
    } else {
      window.open(url, '_blank')?.focus();
    }
  };
}
