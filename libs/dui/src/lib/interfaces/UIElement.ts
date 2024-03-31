import { InputSignalWithTransform } from '@angular/core';
import { Observable } from 'rxjs';

import { AvailableStateScope } from '../services/state-store.service';

export type StateSubscriptionConfig = {
  [K in AvailableStateScope]?: string[];
};

export type UIElementTemplate = {
  id: string;
  type: string;
  remoteResourceId?: string;
  stateSubscription?: StateSubscriptionConfig;
  options: Record<string, unknown>;
};

export type UIElementInstance = {
  id: string;
  uiElementTemplateId: string;
  positionAndSize?: {
    x?: number;
    y?: number;
    cols?: number;
    rows?: number;
    resizeEnabled?: boolean;
    dragEnabled?: boolean;
  };
};

export type UIElementRequiredConfigs = {
  isLoading: boolean;
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

export type UIElementImplementation<TConfigs extends Record<string, unknown>> =
  UIElementRequiredInputOptions & CreateUIElementInputOptions<TConfigs>;
