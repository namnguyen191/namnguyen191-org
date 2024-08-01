import { Brand } from '@namnguyen191/types-helper';

import { FetchDataParams } from '../services/data-fetching.service';
import { StateSubscriptionConfig } from './Global';
import { UICommAction } from './UICommunication';

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
    onSuccess?: UICommAction[];
    parallel?: boolean;
  };
};
