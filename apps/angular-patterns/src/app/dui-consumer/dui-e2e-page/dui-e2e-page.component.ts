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
  DuiComponent,
  EventObject,
  EventsService,
  LayoutService,
  RemoteResourceService,
  UIElementFactoryService,
  UIElementTemplatesService,
} from '@namnguyen191/dui';
import {
  SimpleButtonComponent,
  SimpleTableComponent as MUITableComponent,
  TabsComponent,
} from '@namnguyen191/mui-components';
import { ButtonModule } from 'carbon-components-angular';
import { delay, filter, mergeMap, of, switchMap, tap } from 'rxjs';

import { LayoutsService } from '../services/layouts.service';
import { RemoteResourcesService } from '../services/remote-resources.service';
import { UIElementTemplatesService as UIElementTemplatesServiceAPI } from '../services/ui-element-templates.service';

@Component({
  selector: 'namnguyen191-dui-e2e-page',
  standalone: true,
  imports: [CommonModule, DuiComponent, ButtonModule],
  templateUrl: './dui-e2e-page.component.html',
  styleUrl: './dui-e2e-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiE2EPageComponent {
  layoutId: WritableSignal<string> = signal('LAYOUT_CARBON_MAIN');

  uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  remoteResourceService: RemoteResourceService = inject(RemoteResourceService);
  eventsService: EventsService = inject(EventsService);
  layoutService: LayoutService = inject(LayoutService);
  layoutsServiceAPI: LayoutsService = inject(LayoutsService);
  uiElementTemplatesServiceAPI: UIElementTemplatesServiceAPI = inject(UIElementTemplatesServiceAPI);
  remoteResourcesServiceAPI: RemoteResourcesService = inject(RemoteResourcesService);
  destroyRef = inject(DestroyRef);

  constructor() {
    this.setupEventsListener();

    this.uiElementFactoryService.registerUIElement({
      type: CarbonTableComponent.ELEMENT_TYPE,
      component: CarbonTableComponent,
    });

    this.#triggerChanges();
  }

  setupEventsListener(): void {
    const allEvents = this.eventsService.getEvents().pipe(takeUntilDestroyed(this.destroyRef));

    const missingLayoutEvents = allEvents.pipe(
      filter(
        (event): event is Extract<EventObject, { type: 'MISSING_LAYOUT' }> =>
          event.type === 'MISSING_LAYOUT'
      ),
      switchMap((event) => {
        const missingLayoutId = event.payload.id;
        return this.layoutsServiceAPI.getLayoutById(missingLayoutId);
      }),
      tap((layout) => this.layoutService.registerLayout(layout))
    );

    missingLayoutEvents.subscribe();

    const missingUIElementTemplates = allEvents.pipe(
      filter(
        (event): event is Extract<EventObject, { type: 'MISSING_UI_ELEMENT_TEMPLATE' }> =>
          event.type === 'MISSING_UI_ELEMENT_TEMPLATE'
      ),
      mergeMap((event) => {
        const missingUIElementTemplateId = event.payload.id;
        return this.uiElementTemplatesServiceAPI
          .getUIElementTemplateById(missingUIElementTemplateId)
          .pipe(
            tap((uiElementTemplate) => {
              try {
                this.uiElementTemplatesService.registerUIElementTemplate(uiElementTemplate);
              } catch (error) {
                console.log('Nam data is: duplicated registration');
              }
            })
          );
      })
    );

    missingUIElementTemplates.subscribe();

    const missingRemoteResources = allEvents.pipe(
      filter(
        (event): event is Extract<EventObject, { type: 'MISSING_REMOTE_RESOURCE' }> =>
          event.type === 'MISSING_REMOTE_RESOURCE'
      ),
      mergeMap((event) => {
        const missingRemoteResourceId = event.payload.id;
        return this.remoteResourcesServiceAPI.getRemoteResourceById(missingRemoteResourceId);
      }),
      tap((remoteResource) => this.remoteResourceService.registerRemoteResource(remoteResource))
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
    console.log('Nam data is: ', id);
    this.layoutId.set(id);
  }
}
