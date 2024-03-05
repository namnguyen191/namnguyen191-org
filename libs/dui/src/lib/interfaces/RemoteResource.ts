import { FetchDataParams } from '../services';

export type Request = FetchDataParams;

export type RemoteResourceConfigs = {
  id: string;
  requests: Request[];
};
