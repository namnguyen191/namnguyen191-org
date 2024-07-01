import { inject } from '@angular/core';

import {
  AddToStateAction,
  TriggerRemoteResourceAction,
  UICommAction,
  UICommActionHandlers,
} from '../../interfaces';
import { RemoteResourceService } from '../remote-resource.service';
import { StateStoreService } from '../state-store.service';

const handleTriggerRemoteResource = (action: TriggerRemoteResourceAction): void => {
  const {
    payload: { remoteResourceId },
  } = action;
  inject(RemoteResourceService).triggerResource(remoteResourceId);
};

const handleAddToState = (action: AddToStateAction): void => {
  inject(StateStoreService).addToState(action.payload);
};

const actionsHandlersMap: UICommActionHandlers = {
  handleAddToState,
  handleTriggerRemoteResource,
};

export const triggerUIAction = (action: UICommAction): void => {
  switch (action.type) {
    case 'triggerRemoteResource':
      actionsHandlersMap.handleTriggerRemoteResource(action);
      break;
    case 'addToState':
      actionsHandlersMap.handleAddToState(action);
      break;
    default:
      console.warn('Unknown action: ', action);
  }
};

export const triggerMultipleUIActions = (actions: UICommAction[]): void => {
  for (const action of actions) {
    triggerUIAction(action);
  }
};
