import { Brand } from '@namnguyen191/types-helper';

import { FetchDataParams } from '../services/data-fetching.service';
import { UICommAction } from './UICommunication';

export type RawJsString = Brand<string, 'RawJsString'>;

export type Request = {
  configs: FetchDataParams;
  interpolation?: string;
};

export type RemoteResourceConfigs = {
  id: string;
  options: {
    requests: Request[];
    onSuccess?: UICommAction[];
  };
};
