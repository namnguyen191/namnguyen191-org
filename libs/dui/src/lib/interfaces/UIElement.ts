import { InputSignalWithTransform } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { Observable } from 'rxjs';

import { AvailableStateScope } from '../services/state-store.service';

export type StateSubscriptionConfig = {
  [K in AvailableStateScope]?: string[];
};

export type UIElementRequiredConfigs = {
  isLoading: boolean;
  isError: boolean;
};

export type EmptyObject = Record<string, never>;

export type UIElementTemplateOptions<T extends ObjectType = EmptyObject> =
  Partial<UIElementRequiredConfigs> & T;

export type UIElementTemplate<T extends ObjectType = EmptyObject> = {
  id: string;
  type: string;
  remoteResourceId?: string;
  stateSubscription?: StateSubscriptionConfig;
  options: UIElementTemplateOptions<T>;
};

export type UIElementPositionAndSize = {
  x: number;
  y: number;
  cols: number;
  rows: number;
};

export type UIElementInstance = {
  id: string;
  uiElementTemplateId: string;
  positionAndSize?: Partial<UIElementPositionAndSize> & {
    resizeEnabled?: boolean;
    dragEnabled?: boolean;
  };
};

export type CreateUIElementInputOptions<TConfigs> = Required<{
  [K in keyof TConfigs as K extends string ? `${K}ConfigOption` : never]: InputSignalWithTransform<
    Observable<TConfigs[K]>,
    TConfigs[K] | Observable<TConfigs[K]>
  >;
}>;

export type UIElementRequiredInputOptions = CreateUIElementInputOptions<UIElementRequiredConfigs>;

export type UIElementRequiredInputs = {
  [K in keyof UIElementRequiredConfigs as K extends string ? `${K}ConfigOption` : never]:
    | UIElementRequiredConfigs[K]
    | Observable<UIElementRequiredConfigs[K]>;
};

export type UIElementImplementation<TConfigs extends ObjectType> = UIElementRequiredInputOptions &
  CreateUIElementInputOptions<TConfigs>;
