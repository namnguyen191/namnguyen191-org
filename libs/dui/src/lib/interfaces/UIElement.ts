import { InputSignal } from '@angular/core';

export type UIElementTemplate = {
  id: string;
  type: string;
};

export type UIElementInstance = {
  id: string;
  uiElementTemplateId: string;
};

export type UIElementImplementation<TConfigs extends Record<string, unknown>> = Required<{
  [K in keyof TConfigs as K extends string ? `${K}ConfigOption` : never]: InputSignal<TConfigs[K]>;
}>;
