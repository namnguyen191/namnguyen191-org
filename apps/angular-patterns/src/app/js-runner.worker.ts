/// <reference lib="webworker" />

import { GetWorkerEvent } from '@namnguyen191/dui';

addEventListener('message', (e: MessageEvent<GetWorkerEvent<'INTERPOLATE'>>) => {
  const { data } = e;
  const response = `Interpolating ${data.payload.rawJS}`;
  postMessage(response);
});
