import { InjectionToken, Type } from '@angular/core';

export const INTERPOLATION_REGEX = /^(<\${)(.*)(}\$>)$/;

export type DuiCoreConfig = {
  layoutLoadingComponent?: Type<unknown>;
  uiElementLoadingComponent?: Type<unknown>;
};
export const DUI_CORE_CONFIG = new InjectionToken<DuiCoreConfig>('CORE_CONFIG');
