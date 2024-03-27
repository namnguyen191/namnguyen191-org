import { Brand } from '@namnguyen191/types-helper';

import { FetchDataParams } from '../services';
import { UICommAction } from './UICommunication';

export type RawJsString = Brand<string, 'RawJsString'>;

export type Request = {
  options: FetchDataParams;
  interpolation?: string;
};

export type RemoteResourceConfigs = {
  id: string;
  requests: Request[];
  onSuccess?: UICommAction[];
};
