import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EnvironmentInjector,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { CarbonButtonComponent, CarbonTableComponent } from '@namnguyen191/carbon-components';
import {
  getDefaultActionsHooksMap,
  getDefaultActionsHooksParsersMap,
  getHttpFetcher,
  missingLayoutTemplateEvent,
  missingRemoteResourceTemplateEvent,
  missingUIElementTemplateEvent,
  UIElementRepositionEvent,
} from '@namnguyen191/dui-common';
import {
  ActionHookService,
  DataFetchingService,
  EventsService,
  LayoutTemplateService,
  RemoteResourceTemplateService,
  UIElementFactoryService,
  UIElementPositionAndSize,
  UIElementTemplateService,
} from '@namnguyen191/dui-core';
import { NotificationModule, ToastContent } from 'carbon-components-angular';
import { set } from 'lodash-es';
import { buffer, debounceTime, forkJoin, map, mergeMap, switchMap, tap } from 'rxjs';

import { LayoutsService } from '../services/layouts.service';
import { RemoteResourcesService as RemoteResourcesServiceAPI } from '../services/remote-resources.service';
import { UIElementTemplateService as UIElementTemplatesServiceAPI } from '../services/ui-element-templates.service';

@Component({
  selector: 'namnguyen191-dui-e2e-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationModule],
  templateUrl: './dui-e2e-page.component.html',
  styleUrl: './dui-e2e-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiE2EPageComponent {
  readonly #uiElementTemplatesService = inject(UIElementTemplateService);
  readonly #uiElementFactoryService = inject(UIElementFactoryService);
  readonly #remoteResourceTemplateService = inject(RemoteResourceTemplateService);
  readonly #eventsService = inject(EventsService);
  readonly #layoutService = inject(LayoutTemplateService);
  readonly #layoutsServiceAPI = inject(LayoutsService);
  readonly #uiElementTemplatesServiceAPI = inject(UIElementTemplatesServiceAPI);
  readonly #actionHookService = inject(ActionHookService);
  readonly #remoteResourcesServiceAPI = inject(RemoteResourcesServiceAPI);
  readonly #destroyRef = inject(DestroyRef);
  readonly #injector = inject(EnvironmentInjector);
  readonly #dataFetchingService = inject(DataFetchingService);

  isNotificationDisplayed = signal<boolean>(false);
  notificationConfig: ToastContent = {
    type: 'info',
    title: 'Custom hook toast',
    subtitle: 'This toast was triggered by a custom hook',
    caption:
      'Testing custom action hook by registering a hook that open this toast. If you are seeing this toast then it is working',
    showClose: true,
  };

  constructor() {
    this.setupEventsListener();

    this.#uiElementFactoryService.registerUIElement({
      type: CarbonTableComponent.ELEMENT_TYPE,
      component: CarbonTableComponent,
    });

    this.#uiElementFactoryService.registerUIElement({
      type: CarbonButtonComponent.ELEMENT_TYPE,
      component: CarbonButtonComponent,
    });

    this.#actionHookService.registerHooks(getDefaultActionsHooksMap(this.#injector));
    this.#actionHookService.registerHookParsers(getDefaultActionsHooksParsersMap());
    this.#actionHookService.registerHook('showTestNotification', () => this.#showNotification());

    this.#dataFetchingService.registerFetcher('httpFetcher', getHttpFetcher(this.#injector));
  }

  #showNotification(): void {
    this.isNotificationDisplayed.set(true);
  }

  setupEventsListener(): void {
    const allEvents = this.#eventsService.getEvents().pipe(takeUntilDestroyed(this.#destroyRef));

    const missingLayoutEvents = allEvents.pipe(
      missingLayoutTemplateEvent(),
      switchMap((event) => {
        const missingLayoutId = event.payload.id;
        this.#layoutService.startRegisteringLayoutTemplate(missingLayoutId);
        return this.#layoutsServiceAPI.getLayoutById(missingLayoutId);
      }),
      tap((layout) => this.#layoutService.registerLayoutTemplate(layout))
    );

    missingLayoutEvents.subscribe();

    const missingUIElementTemplates = allEvents.pipe(
      missingUIElementTemplateEvent(),
      mergeMap((event) => {
        const missingUIElementTemplateId = event.payload.id;
        return this.#uiElementTemplatesServiceAPI
          .getUIElementTemplateById(missingUIElementTemplateId)
          .pipe(
            tap((uiElementTemplate) => {
              this.#uiElementTemplatesService.registerUIElementTemplate(uiElementTemplate);
            })
          );
      })
    );

    missingUIElementTemplates.subscribe();

    const missingRemoteResources = allEvents.pipe(
      missingRemoteResourceTemplateEvent(),
      mergeMap((event) => {
        const missingRemoteResourceId = event.payload.id;
        return this.#remoteResourcesServiceAPI.getRemoteResourceById(missingRemoteResourceId);
      }),
      tap((remoteResource) =>
        this.#remoteResourceTemplateService.registerRemoteResourceTemplate(remoteResource)
      )
    );

    missingRemoteResources.subscribe();

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
          this.#layoutsServiceAPI.updateLayoutElementPositionAndSize(layoutId, eleWithNewPosAndSize)
        );
        return forkJoin(updateLayoutRequests);
      })
    );

    updateElementPosition.subscribe();
  }
}
