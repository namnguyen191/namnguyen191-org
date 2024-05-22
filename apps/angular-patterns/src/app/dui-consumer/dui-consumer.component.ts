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
  SimpleTableComponent,
  TabsComponent,
} from '@namnguyen191/mui-components';
import { filter, mergeMap, switchMap, tap } from 'rxjs';

import { LayoutsService } from './services/layouts.service';
import { RemoteResourcesService } from './services/remote-resources.service';
import { UIElementTemplatesService as UIElementTemplatesServiceAPI } from './services/ui-element-templates.service';

@Component({
  selector: 'namnguyen191-dui-consumer',
  standalone: true,
  imports: [CommonModule, DuiComponent],
  templateUrl: './dui-consumer.component.html',
  styleUrl: './dui-consumer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiConsumerComponent {
  layoutId: WritableSignal<string> = signal('LAYOUT_MAIN');

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
      type: SimpleTableComponent.ELEMENT_TYPE,
      component: SimpleTableComponent,
    });

    this.uiElementFactoryService.registerUIElement({
      type: TabsComponent.ELEMENT_TYPE,
      component: TabsComponent,
    });

    this.uiElementFactoryService.registerUIElement({
      type: SimpleButtonComponent.ELEMENT_TYPE,
      component: SimpleButtonComponent,
    });

    // setTimeout(() => {
    //   const updatedMainLayout = {
    //     ...mainLayout,
    //     uiElementInstances: [
    //       {
    //         id: 'instance-3',
    //         uiElementTemplateId: 'MY_SIMPLE_TABLE_V2',
    //         positionAndSize: {
    //           x: 8,
    //           rows: 10,
    //           cols: 4,
    //           resizeEnabled: false,
    //         },
    //       },
    //     ],
    //   };
    //   this.layoutService.updateLayout(updatedMainLayout);
    // }, 5000);
    // setTimeout(() => {
    //   this._testChangingTemplateAndElement();
    // }, 5000);
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
      switchMap((event) => {
        const missingRemoteResourceId = event.payload.id;
        return this.remoteResourcesServiceAPI.getRemoteResourceById(missingRemoteResourceId);
      }),
      tap((remoteResource) => this.remoteResourceService.registerRemoteResource(remoteResource))
    );

    missingRemoteResources.subscribe();
  }

  // private _testChangingTemplateAndElement(): void {
  //   console.log(
  //     `------------------- Before setting layout to: ${testLayout.id} -------------------`
  //   );
  //   this.layoutId.set(testLayout.id);
  //   setTimeout(() => {
  //     console.log(
  //       `------------------- Before setting layout to: ${testLayout2.id} -------------------`
  //     );
  //     this.layoutId.set(testLayout2.id);
  //     setTimeout(() => {
  //       console.log(
  //         `------------------- Before update ui element for: ${simpleTable2updated.id} -------------------`
  //       );
  //       this.uiElementTemplatesService.updateUIElementTemplate(simpleTable2updated);

  //       setTimeout(() => {
  //         console.log(
  //           `------------------- Before setting layout to: ${testLayout.id} -------------------`
  //         );
  //         this.layoutId.set(testLayout.id);
  //       }, 5000);
  //     }, 5000);
  //   }, 5000);
  // }
}
