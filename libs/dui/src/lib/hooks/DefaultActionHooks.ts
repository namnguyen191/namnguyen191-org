import { inject } from '@angular/core';

import {
  AddToStateActionHook,
  DefaultActionHooksHandlers,
  TriggerRemoteResourceActionHook,
} from '../interfaces';
import { ActionHooksHandlersMap } from '../services/action-hook.service';
import { RemoteResourceService } from '../services/remote-resource.service';
import { StateStoreService } from '../services/state-store.service';

const handleTriggerRemoteResource = (action: TriggerRemoteResourceActionHook): void => {
  const {
    payload: { remoteResourceId },
  } = action;
  inject(RemoteResourceService).triggerResource(remoteResourceId);
};

const handleAddToState = (action: AddToStateActionHook): void => {
  inject(StateStoreService).addToState(action.payload);
};

const actionsHandlersMap: DefaultActionHooksHandlers = {
  handleAddToState,
  handleTriggerRemoteResource,
};

export const defaultActionHooksHandlersMap = {
  triggerRemoteResource: actionsHandlersMap.handleTriggerRemoteResource,
  addToState: actionsHandlersMap.handleAddToState,
} as ActionHooksHandlersMap;
