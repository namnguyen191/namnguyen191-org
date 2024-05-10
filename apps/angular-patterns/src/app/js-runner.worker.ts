/// <reference lib="webworker" />

import { handleRunJsMessage } from '@namnguyen191/dui';

addEventListener('message', (e) => {
  const allowList = new Set<string>(['console', 'JSON']);
  handleRunJsMessage(e, allowList);
});
