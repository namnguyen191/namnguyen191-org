import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CarbonTableComponent } from '@namnguyen191/carbon-components';
import {
  ActionHookService,
  DuiComponent,
  EventsService,
  LayoutTemplateService,
  missingLayoutTemplateEvent,
  missingRemoteResourceTemplateEvent,
  missingUIElementTemplateEvent,
  RemoteResourceTemplateService,
  UIElementFactoryService,
  UIElementTemplateService,
} from '@namnguyen191/dui';
import {
  SimpleButtonComponent,
  SimpleTableComponent as MUITableComponent,
  TabsComponent,
} from '@namnguyen191/mui-components';
import { ButtonModule, NotificationModule, ToastContent } from 'carbon-components-angular';
import { delay, mergeMap, of, switchMap, tap } from 'rxjs';

import { LayoutsService } from '../services/layouts.service';
import { RemoteResourcesService } from '../services/remote-resources.service';
import { UIElementTemplateService as UIElementTemplatesServiceAPI } from '../services/ui-element-templates.service';

@Component({
  selector: 'namnguyen191-dui-e2e-page',
  standalone: true,
  imports: [CommonModule, DuiComponent, ButtonModule, NotificationModule],
  templateUrl: './dui-e2e-page.component.html',
  styleUrl: './dui-e2e-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiE2EPageComponent {
  layoutId: WritableSignal<string> = signal('LAYOUT_CARBON_MAIN');

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
  remoteResourcesServiceAPI: RemoteResourcesService = inject(RemoteResourcesService);
  destroyRef = inject(DestroyRef);

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

    this.actionHookService.registerHook('showTestNotification', () => this.#showNotification());

    // this.#triggerChanges();
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

  private registerMUIComponent(): void {
    this.uiElementFactoryService.registerUIElement({
      type: TabsComponent.ELEMENT_TYPE,
      component: TabsComponent,
    });

    this.uiElementFactoryService.registerUIElement({
      type: SimpleButtonComponent.ELEMENT_TYPE,
      component: SimpleButtonComponent,
    });

    this.uiElementFactoryService.registerUIElement({
      type: MUITableComponent.ELEMENT_TYPE,
      component: MUITableComponent,
    });
  }

  #triggerChanges(): void {
    of(null)
      .pipe(
        delay(5000),
        tap(() => this.#changeLayout('LAYOUT_CARBON_TEST'))
      )
      .subscribe();
  }

  #changeLayout(id: string): void {
    console.log('Changing layout to:', id);
    this.layoutId.set(id);
  }
}
