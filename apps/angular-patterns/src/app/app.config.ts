import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { CarbonComponentLoader } from '@dj-ui/carbon-components';
import { COMMON_SETUP_CONFIG, SetupConfigs } from '@dj-ui/common';
import { CORE_CONFIG, JS_RUNNER_WORKER } from '@dj-ui/core';
import { globalDelayInterceptorFactory } from '@namnguyen191/common-angular-helper';
import { provideMonacoEditor } from 'ngx-monaco-editor-v2';

import { appRoutes } from './app.routes';
import { DuiLayoutLoadingComponent } from './components/dui-layout-loading/dui-layout-loading.component';
import { DuiUiElementLoadingComponent } from './components/dui-ui-element-loading/dui-ui-element-loading.component';
import { LayoutsService } from './dui-consumer/services/layouts.service';
import { RemoteResourcesService } from './dui-consumer/services/remote-resources.service';
import { UIElementTemplateService } from './dui-consumer/services/ui-element-templates.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMonacoEditor(),
    provideExperimentalZonelessChangeDetection(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      })
    ),
    provideHttpClient(withInterceptors([globalDelayInterceptorFactory(100)])),
    provideAnimationsAsync(),
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
    {
      provide: CORE_CONFIG,
      useValue: {
        layoutLoadingComponent: DuiLayoutLoadingComponent,
        uiElementLoadingComponent: DuiUiElementLoadingComponent,
      },
    },
    {
      provide: COMMON_SETUP_CONFIG,
      useFactory: (): SetupConfigs => {
        const layoutsServiceAPI = inject(LayoutsService);
        const uiElementTemplateService = inject(UIElementTemplateService);
        const remoteResourcesService = inject(RemoteResourcesService);

        return {
          templatesHandlers: {
            getLayoutTemplate: layoutsServiceAPI.getLayoutById,
            getUiElementTemplate: uiElementTemplateService.getUIElementTemplateById,
            getRemoteResourceTemplate: remoteResourcesService.getRemoteResourceById,
            // updateElementsPositionsHandler: layoutsServiceAPI.updateLayoutElementPositionAndSize,
          },
          componentLoadersMap: CarbonComponentLoader,
        };
      },
    },
  ],
};
