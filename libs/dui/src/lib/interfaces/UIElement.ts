import { InputSignal, InputSignalWithTransform } from '@angular/core';
import { EmptyObject, ObjectType } from '@namnguyen191/types-helper';
import { Observable } from 'rxjs';

import { StateSubscriptionConfig } from './Global';

export type UIElementRequiredConfigs = {
  isLoading: boolean;
  isError: boolean;
};

export type UIElementTemplateOptions<T extends ObjectType = EmptyObject> =
  Partial<UIElementRequiredConfigs> & T;

export type UIElementTemplate<T extends ObjectType = EmptyObject> = {
  id: string;
  type: string;
  remoteResourceId?: string;
  stateSubscription?: StateSubscriptionConfig;
  options: UIElementTemplateOptions<T>;
};

export type CreateUIElementInputOptions<TConfigs> = Required<{
  [K in keyof TConfigs as K extends string ? `${K}ConfigOption` : never]:
    | InputSignal<TConfigs[K]>
    | InputSignalWithTransform<TConfigs[K], unknown>;
}>;

export type UIElementRequiredInputOptions = CreateUIElementInputOptions<UIElementRequiredConfigs>;

export type UIElementRequiredInputs = {
  [K in keyof UIElementRequiredConfigs as K extends string ? `${K}ConfigOption` : never]:
    | UIElementRequiredConfigs[K]
    | Observable<UIElementRequiredConfigs[K]>;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type UIElementImplementation<TConfigs extends ObjectType = {}> =
  UIElementRequiredInputOptions & CreateUIElementInputOptions<TConfigs>;

export const ComponentContextPropertyKey = '$context$';
