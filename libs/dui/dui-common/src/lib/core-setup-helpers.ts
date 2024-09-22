import { inject, InjectionToken, Type } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActionHookHandlerAndPayloadParserMap,
  ActionHookService,
  BaseUIElementComponent,
  DataFetchingService,
  EventsService,
  LayoutTemplate,
  LayoutTemplateService,
  logWarning,
  RemoteResourceTemplate,
  RemoteResourceTemplateService,
  UIElementFactoryService,
  UIElementLoader,
  UIElementPositionAndSize,
  UIElementTemplate,
  UIElementTemplateService,
} from '@namnguyen191/dui-core';
import { set } from 'lodash-es';
import { buffer, debounceTime, forkJoin, map, mergeMap, Observable, tap } from 'rxjs';

import { HttpFetcherService } from './data-fetchers/http-fetcher.service';
import {
  DefaultActionsHooksService,
  ZAddToStateActionHookPayload,
  ZNavigateHookPayload,
  ZTriggerRemoteResourceHookPayload,
} from './defaut-actions-hooks.service';
import {
  missingLayoutTemplateEvent,
  missingRemoteResourceTemplateEvent,
  missingUIElementTemplateEvent,
  UIElementRepositionEvent,
} from './events-filters';

export type TemplatesHandlers = {
  getLayoutTemplate?: (id: string) => Observable<LayoutTemplate>;
  getUiElementTemplate?: (id: string) => Observable<UIElementTemplate>;
  getRemoteResourceTemplate?: (id: string) => Observable<RemoteResourceTemplate>;
  updateElementsPositionsHandler?: (
    layoutId: string,
    eleWithNewPosAndSize: { [id: string]: UIElementPositionAndSize }
  ) => Observable<void>;
};
export type ComponentsMap = { [componentType: string]: Type<BaseUIElementComponent> };
export type ComponentLoadersMap = { [componentType: string]: UIElementLoader };
export type DUISetupConfigs = {
  templatesHandlers?: TemplatesHandlers;
  componentsMap?: ComponentsMap;
  componentLoadersMap?: ComponentLoadersMap;
};
export const DUI_COMMON_SETUP_CONFIG = new InjectionToken<DUISetupConfigs>(
  'DUI_COMMON_SETUP_CONFIG'
);

export const registerDefaultDUIHook = (): void => {
  const defaultActionsHooksService = inject(DefaultActionsHooksService);
  const actionHookService = inject(ActionHookService);

  const actionHookHandlerAndPayloadParserMap: ActionHookHandlerAndPayloadParserMap = {
    addToState: {
      handler: defaultActionsHooksService.handleAddToState,
      payloadParser: ZAddToStateActionHookPayload,
    },
    triggerRemoteResource: {
      handler: defaultActionsHooksService.handleTriggerRemoteResource,
      payloadParser: ZTriggerRemoteResourceHookPayload,
    },
    navigate: {
      handler: defaultActionsHooksService.navigate,
      payloadParser: ZNavigateHookPayload,
    },
  };

  actionHookService.registerHooks(actionHookHandlerAndPayloadParserMap);
};

export const registerDefaultDataFetcher = (): void => {
  const httpFetcher = inject(HttpFetcherService).httpFetcher;
  const dataFetchingService = inject(DataFetchingService);

  dataFetchingService.registerFetcher('httpFetcher', httpFetcher);
};

export const setupEventsListener = (params: TemplatesHandlers): void => {
  const {
    getLayoutTemplate,
    getUiElementTemplate,
    getRemoteResourceTemplate,
    updateElementsPositionsHandler,
  } = params;
  const eventsService = inject(EventsService);
  const layoutTemplateService = inject(LayoutTemplateService);
  const uiElementTemplatesService = inject(UIElementTemplateService);
  const remoteResourceTemplateService = inject(RemoteResourceTemplateService);

  const allEvents = eventsService.getEvents().pipe(takeUntilDestroyed());

  if (getLayoutTemplate) {
    const missingLayoutEvents = allEvents.pipe(
      missingLayoutTemplateEvent(),
      mergeMap((event) => {
        const missingLayoutId = event.payload.id;
        layoutTemplateService.startRegisteringLayoutTemplate(missingLayoutId);
        return getLayoutTemplate(missingLayoutId);
      }),
      tap((layout) => layoutTemplateService.registerLayoutTemplate(layout))
    );

    missingLayoutEvents.subscribe();
  }

  if (getUiElementTemplate) {
    const missingUIElementTemplates = allEvents.pipe(
      missingUIElementTemplateEvent(),
      mergeMap((event) => {
        const missingUIElementTemplateId = event.payload.id;
        return getUiElementTemplate(missingUIElementTemplateId);
      }),
      tap((uiElementTemplate) => {
        uiElementTemplatesService.registerUIElementTemplate(uiElementTemplate);
      })
    );
    missingUIElementTemplates.subscribe();
  }

  if (getRemoteResourceTemplate) {
    const missingRemoteResources = allEvents.pipe(
      missingRemoteResourceTemplateEvent(),
      mergeMap((event) => {
        const missingRemoteResourceId = event.payload.id;
        return getRemoteResourceTemplate(missingRemoteResourceId);
      }),
      tap((remoteResource) =>
        remoteResourceTemplateService.registerRemoteResourceTemplate(remoteResource)
      )
    );

    missingRemoteResources.subscribe();
  }

  if (updateElementsPositionsHandler) {
    const uiElementReposition = allEvents.pipe(UIElementRepositionEvent());

    const buffTrigger = uiElementReposition.pipe(debounceTime(3000));

    const updateElementPosition = uiElementReposition.pipe(
      buffer(buffTrigger),
      map((events) =>
        events.reduce<{ [layoutId: string]: { [eleId: string]: UIElementPositionAndSize } }>(
          (acc, cur) => {
            const {
              payload: { elementId, layoutId, newPositionAndSize },
            } = cur;
            acc = set(acc, `${layoutId}.${elementId}`, newPositionAndSize);
            return acc;
          },
          {}
        )
      ),
      mergeMap((val) => {
        const updateLayoutRequests = Object.entries(val).map(([layoutId, eleWithNewPosAndSize]) =>
          updateElementsPositionsHandler(layoutId, eleWithNewPosAndSize)
        );
        return forkJoin(updateLayoutRequests);
      })
    );

    updateElementPosition.subscribe();
  }
};

export const registerComponents = (componentsMaps: ComponentsMap): void => {
  const uiElementFactoryService = inject(UIElementFactoryService);

  for (const [componentType, componentClass] of Object.entries(componentsMaps)) {
    uiElementFactoryService.registerUIElement({
      type: componentType,
      component: componentClass,
    });
  }
};

export const registerComponentLoaders = (componentLoadersMap: ComponentLoadersMap): void => {
  const uiElementFactoryService = inject(UIElementFactoryService);

  for (const [componentType, loader] of Object.entries(componentLoadersMap)) {
    uiElementFactoryService.registerUIElementLoader({
      type: componentType,
      loader,
    });
  }
};

export const setupDefaultDUI = (): void => {
  let configs: DUISetupConfigs;
  try {
    configs = inject(DUI_COMMON_SETUP_CONFIG);
  } catch (_error) {
    logWarning(
      'No configs was provided for DUI default setup, please provide values for the DUI_COMMON_SETUP_CONFIG token'
    );
    return;
  }

  registerDefaultDUIHook();
  registerDefaultDataFetcher();

  const { templatesHandlers, componentsMap, componentLoadersMap } = configs;

  if (templatesHandlers) {
    setupEventsListener(templatesHandlers);
  }

  if (componentsMap) {
    registerComponents(componentsMap);
  }

  if (componentLoadersMap) {
    registerComponentLoaders(componentLoadersMap);
  }
};
