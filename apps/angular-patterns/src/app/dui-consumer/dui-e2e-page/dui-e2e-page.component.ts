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
  ActionHookService,
  EventsService,
  getDefaultActionsHooksMap,
  LayoutTemplateService,
  missingLayoutTemplateEvent,
  missingRemoteResourceTemplateEvent,
  missingUIElementTemplateEvent,
  RemoteResourceTemplateService,
  UIElementFactoryService,
  UIElementTemplateService,
} from '@namnguyen191/dui';
import { NotificationModule, ToastContent } from 'carbon-components-angular';
import { mergeMap, switchMap, tap } from 'rxjs';

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
  uiElementTemplatesService: UIElementTemplateService = inject(UIElementTemplateService);
  uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  remoteResourceTemplateService: RemoteResourceTemplateService = inject(
    RemoteResourceTemplateService
  );
  eventsService: EventsService = inject(EventsService);
  layoutService: LayoutTemplateService = inject(LayoutTemplateService);
  layoutsServiceAPI: LayoutsService = inject(LayoutsService);
  uiElementTemplatesServiceAPI: UIElementTemplatesServiceAPI = inject(UIElementTemplatesServiceAPI);
  actionHookService: ActionHookService = inject(ActionHookService);
  remoteResourcesServiceAPI: RemoteResourcesServiceAPI = inject(RemoteResourcesServiceAPI);
  destroyRef = inject(DestroyRef);
  injector = inject(EnvironmentInjector);

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

    this.uiElementFactoryService.registerUIElement({
      type: CarbonTableComponent.ELEMENT_TYPE,
      component: CarbonTableComponent,
    });

    this.uiElementFactoryService.registerUIElement({
      type: CarbonButtonComponent.ELEMENT_TYPE,
      component: CarbonButtonComponent,
    });

    this.actionHookService.registerHooks(getDefaultActionsHooksMap(this.injector));
    this.actionHookService.registerHook('showTestNotification', () => this.#showNotification());
  }

  #showNotification(): void {
    this.isNotificationDisplayed.set(true);
  }

  setupEventsListener(): void {
    const allEvents = this.eventsService.getEvents().pipe(takeUntilDestroyed(this.destroyRef));

    const missingLayoutEvents = allEvents.pipe(
      missingLayoutTemplateEvent(),
      switchMap((event) => {
        const missingLayoutId = event.payload.id;
        this.layoutService.startRegisteringLayoutTemplate(missingLayoutId);
        return this.layoutsServiceAPI.getLayoutById(missingLayoutId);
      }),
      tap((layout) => this.layoutService.registerLayoutTemplate(layout))
    );

    missingLayoutEvents.subscribe();

    const missingUIElementTemplates = allEvents.pipe(
      missingUIElementTemplateEvent(),
      mergeMap((event) => {
        const missingUIElementTemplateId = event.payload.id;
        return this.uiElementTemplatesServiceAPI
          .getUIElementTemplateById(missingUIElementTemplateId)
          .pipe(
            tap((uiElementTemplate) => {
              this.uiElementTemplatesService.registerUIElementTemplate(uiElementTemplate);
            })
          );
      })
    );

    missingUIElementTemplates.subscribe();

    const missingRemoteResources = allEvents.pipe(
      missingRemoteResourceTemplateEvent(),
      mergeMap((event) => {
        const missingRemoteResourceId = event.payload.id;
        return this.remoteResourcesServiceAPI.getRemoteResourceById(missingRemoteResourceId);
      }),
      tap((remoteResource) =>
        this.remoteResourceTemplateService.registerRemoteResourceTemplate(remoteResource)
      )
    );

    missingRemoteResources.subscribe();
  }
}
