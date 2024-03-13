/// <reference lib="webworker" />

import { handleRunJsMessage } from '@namnguyen191/dui';

addEventListener('message', (e) => {
  handleRunJsMessage(e);
});
