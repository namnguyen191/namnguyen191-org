import { AvailableStateScope } from '../services/state-store.service';

export const INTERPOLATION_REGEX = /^(<\${)(.*)(}\$>)$/;

export type StateSubscriptionConfig = {
  [K in AvailableStateScope]?: string[];
};
