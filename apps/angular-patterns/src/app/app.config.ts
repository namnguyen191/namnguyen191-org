import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { JS_RUNNER_WORKER } from '@namnguyen191/dui';

import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
    {
      provide: JS_RUNNER_WORKER,
      useFactory: (): Worker => {
        const worker = new Worker(new URL('./js-runner.worker', import.meta.url), {
          name: 'CustomWorker',
          type: 'module',
        });
        return worker;
      },
    },
  ],
};
