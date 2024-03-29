import { inject } from '@angular/core';

import { AddToStateAction, TriggerRemoteResourceAction, UICommAction } from '../../interfaces';
import { RemoteResourceService } from '../remote-resource.service';
import { StateStoreService } from '../state-store.service';

export const handleTestAction = (action: { type: 'testAction' }): void => {
  console.log('Nam data is: handling', action);
};

export const handleTriggerRemoteResource = (action: TriggerRemoteResourceAction): void => {
  const {
    payload: { remoteResourceId },
  } = action;
  inject(RemoteResourceService).reloadResource(remoteResourceId);
};

export const handleAddToState = (action: AddToStateAction): void => {
  inject(StateStoreService).addToState(action.payload);
};

export const triggerUIAction = (action: UICommAction): void => {
  switch (action.type) {
    case 'testAction':
      handleTestAction(action);
      break;
    case 'triggerRemoteResource':
      handleTriggerRemoteResource(action);
      break;
    case 'addToState':
      handleAddToState(action);
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
