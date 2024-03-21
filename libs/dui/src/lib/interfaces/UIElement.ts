import { InputSignalWithTransform } from '@angular/core';
import { Observable } from 'rxjs';

export type UIElementTemplate = {
  id: string;
  type: string;
  remoteResourceId?: string;
  options: Record<string, unknown>;
};

export type UIElementInstance = {
  id: string;
  uiElementTemplateId: string;
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
