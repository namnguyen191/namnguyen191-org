import { compactTypes } from 'angular-gridster2/lib/gridsterConfig.interface';

import { ConfigWithStatus } from './shared-types';

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

export type GridConfigs = {
  gap?: number;
  compactType?: compactTypes;
};

export type LayoutTemplate = {
  id: string;
  gridConfigs?: GridConfigs;
  uiElementInstances: UIElementInstance[];
};

export type LayoutTemplateWithStatus = ConfigWithStatus<LayoutTemplate>;

export type LayoutTemplateTypeForJsonSchema = LayoutTemplate;
