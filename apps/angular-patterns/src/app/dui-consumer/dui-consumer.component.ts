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
  LayoutTemplateService,
  RemoteResourceTemplateService,
  UIElementFactoryService,
  UIElementTemplateService,
} from '@namnguyen191/dui';
import {
  SimpleButtonComponent,
  SimpleTableComponent as MUITableComponent,
  TabsComponent,
} from '@namnguyen191/mui-components';
import { ButtonModule } from 'carbon-components-angular';
import { filter, mergeMap, switchMap, tap } from 'rxjs';

import { LayoutsService } from './services/layouts.service';
import { RemoteResourcesService } from './services/remote-resources.service';
import { UIElementTemplateService as UIElementTemplatesServiceAPI } from './services/ui-element-templates.service';

@Component({
  selector: 'namnguyen191-dui-consumer',
  standalone: true,
  imports: [CommonModule, DuiComponent, ButtonModule],
  templateUrl: './dui-consumer.component.html',
  styleUrl: './dui-consumer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiConsumerComponent {
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
  remoteResourcesServiceAPI: RemoteResourcesService = inject(RemoteResourcesService);
  destroyRef = inject(DestroyRef);

  constructor() {
    this.setupEventsListener();

    this.uiElementFactoryService.registerUIElement({
      type: CarbonTableComponent.ELEMENT_TYPE,
      component: CarbonTableComponent,
    });

    // this.registerMUIComponent();

    // this.uiElementFactoryService.registerUIElement({
    //   type: TabsComponent.ELEMENT_TYPE,
    //   component: TabsComponent,
    // });

    // this.uiElementFactoryService.registerUIElement({
    //   type: SimpleButtonComponent.ELEMENT_TYPE,
    //   component: SimpleButtonComponent,
    // });

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
      tap((layout) => this.layoutService.registerLayoutTemplate(layout))
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
              this.uiElementTemplatesService.registerUIElementTemplate(uiElementTemplate);
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
