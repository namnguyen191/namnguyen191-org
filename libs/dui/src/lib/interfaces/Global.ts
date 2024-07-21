import { AvailableStateScope } from '../services/state-store.service';

export const INTERPOLATION_REGEX = /^(<\${)(.*)(}\$>)$/;

export type StateSubscriptionConfig = {
  [K in AvailableStateScope]?: string[];
};

export type TemplateStatus = 'missing' | 'loading' | 'loaded';

export type ConfigWithStatus<TConfig> = {
  id: string;
} & (
  | {
      config: null;
      status: Exclude<TemplateStatus, 'loaded'>;
    }
  | {
      config: TConfig;
      status: Extract<TemplateStatus, 'loaded'>;
    }
);
