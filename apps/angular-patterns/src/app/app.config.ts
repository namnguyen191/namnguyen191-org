import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { CarbonButtonComponent, CarbonTableComponent } from '@namnguyen191/dui-carbon-components';
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
    provideHttpClient(),
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
          componentsMap: {
            [CarbonButtonComponent.ELEMENT_TYPE]: CarbonButtonComponent,
            [CarbonTableComponent.ELEMENT_TYPE]: CarbonTableComponent,
          },
        };
      },
    },
  ],
};
