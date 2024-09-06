import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { globalDelayInterceptorFactory } from '@namnguyen191/common-angular-helper';
import { DUI_COMMON_SETUP_CONFIG, DUISetupConfigs } from '@namnguyen191/dui-common';
import { DUI_CORE_CONFIG, JS_RUNNER_WORKER } from '@namnguyen191/dui-core';

import { appRoutes } from './app.routes';
import { DuiLayoutLoadingComponent } from './components/dui-layout-loading/dui-layout-loading.component';
import { DuiUiElementLoadingComponent } from './components/dui-ui-element-loading/dui-ui-element-loading.component';
import { LayoutsService } from './dui-consumer/services/layouts.service';
import { RemoteResourcesService } from './dui-consumer/services/remote-resources.service';
import { UIElementTemplateService } from './dui-consumer/services/ui-element-templates.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([globalDelayInterceptorFactory(1000)])),
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
      provide: DUI_CORE_CONFIG,
      useValue: {
        layoutLoadingComponent: DuiLayoutLoadingComponent,
        uiElementLoadingComponent: DuiUiElementLoadingComponent,
      },
    },
    {
      provide: DUI_COMMON_SETUP_CONFIG,
      useFactory: (): DUISetupConfigs => {
        const layoutsServiceAPI = inject(LayoutsService);
        const uiElementTemplateService = inject(UIElementTemplateService);
        const remoteResourcesService = inject(RemoteResourcesService);

        return {
          templatesHandlers: {
            getLayoutTemplate: layoutsServiceAPI.getLayoutById,
            getUiElementTemplate: uiElementTemplateService.getUIElementTemplateById,
            getRemoteResourceTemplate: remoteResourcesService.getRemoteResourceById,
            updateElementsPositionsHandler: layoutsServiceAPI.updateLayoutElementPositionAndSize,
          },
          componentLoadersMap: {
            CARBON_BUTTON: () =>
              import('@namnguyen191/dui-carbon-components').then((m) => m.CarbonButtonComponent),
            CARBON_TABLE: () =>
              import('@namnguyen191/dui-carbon-components/carbon-table').then(
                (m) => m.CarbonTableComponent
              ),
            CARBON_TEXT_CARD: () =>
              import('@namnguyen191/dui-carbon-components').then((m) => m.CarbonTextCardComponent),
          },
        };
      },
    },
  ],
};
