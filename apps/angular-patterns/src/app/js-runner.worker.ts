/// <reference lib="webworker" />

import { handleRunJsMessage } from '@namnguyen191/dui-core/js-interpolation-worker';

addEventListener('message', (e) => {
  const allowList = new Set<string>(['console', 'JSON', 'Math']);
  handleRunJsMessage(e, allowList);
});
