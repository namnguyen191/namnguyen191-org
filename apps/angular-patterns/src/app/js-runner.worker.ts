/// <reference lib="webworker" />

import { handleRunJsMessage } from '@dj-ui/core/js-interpolation-worker';

addEventListener('message', (e) => {
  const allowList = new Set<string>(['console', 'JSON', 'Math']);
  handleRunJsMessage(e, allowList);
});
