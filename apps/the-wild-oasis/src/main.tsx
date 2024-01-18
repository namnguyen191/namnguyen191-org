import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app/App';
import { GlobalStyles } from './app/styles/GlobalStyles';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <GlobalStyles />
    <App />
  </StrictMode>
);
