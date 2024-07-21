import { AvailableStateScope } from '../services/state-store.service';

export const INTERPOLATION_REGEX = /^(<\${)(.*)(}\$>)$/;

export type StateSubscriptionConfig = {
  [K in AvailableStateScope]?: string[];
};

export type RenderStatus = 'missing' | 'loading' | 'loaded';

export type ConfigWithStatus<TConfig> = {
  id: string;
} & (
  | {
      config: null;
      status: Exclude<RenderStatus, 'loaded'>;
    }
  | {
      config: TConfig;
      status: Extract<RenderStatus, 'loaded'>;
    }
);
