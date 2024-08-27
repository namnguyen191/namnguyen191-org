import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { CarbonButtonComponent, CarbonTableComponent } from '@namnguyen191/dui-carbon-components';
import { DUI_SETUP_CONFIGS, DUISetupConfigs } from '@namnguyen191/dui-common';
import { JS_RUNNER_WORKER } from '@namnguyen191/dui-core';

import { appRoutes } from './app.routes';
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
      provide: DUI_SETUP_CONFIGS,
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
