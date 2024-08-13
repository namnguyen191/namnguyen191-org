import { inject } from '@angular/core';

import {
  AddToStateActionHook,
  DefaultActionHooksHandlers,
  TriggerRemoteResourceActionHook,
} from '../interfaces';
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

export const actionsHandlersMap: DefaultActionHooksHandlers = {
  handleAddToState,
  handleTriggerRemoteResource,
};
