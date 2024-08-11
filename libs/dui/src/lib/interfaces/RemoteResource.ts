import { Brand } from '@namnguyen191/types-helper';

import { FetchDataParams } from '../services/data-fetching.service';
import { DefaultActionHook } from './ActionHook';
import { StateSubscriptionConfig } from './Global';

export type RawJsString = Brand<string, 'RawJsString'>;

export type Request = {
  configs: FetchDataParams;
  interpolation?: string;
};

export type RemoteResourceTemplate = {
  id: string;
  stateSubscription?: StateSubscriptionConfig;
  options: {
    requests: Request[];
    onSuccess?: DefaultActionHook[];
    parallel?: boolean;
  };
};
