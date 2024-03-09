import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app/App';
import { DarkModeContextProvider } from './app/context/DarkModeContext';
import { GlobalStyles } from './app/styles/GlobalStyles';

const rootElement: HTMLElement | null = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root to render React app is missing');
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <GlobalStyles />
      <DarkModeContextProvider>
        <App />
      </DarkModeContextProvider>
    </StrictMode>
  );
}
