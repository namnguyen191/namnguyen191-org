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
};

export type LayoutTemplate = {
  id: string;
  gridConfigs?: GridConfigs;
  uiElementInstances: UIElementInstance[];
};

export type LayoutTemplateWithStatus = ConfigWithStatus<LayoutTemplate>;

export type LayoutTemplateTypeForJsonSchema = LayoutTemplate;
