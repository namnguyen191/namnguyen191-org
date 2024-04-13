import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import {
  DuiComponent,
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
} from '@namnguyen191/dui/prebuilt-components';

import boredResource from './sample-configs/boredapi-remote-resource.json';
import testLayout from './sample-configs/layout-1.json';
import testLayout2 from './sample-configs/layout-2.json';
import mainLayout from './sample-configs/main-layout.json';
import simpleTableV2 from './sample-configs/my_simple_table_v2.json';
import simpleButton1 from './sample-configs/simple_button_1.json';
import tabs1 from './sample-configs/simple_tab_1.json';
import tabs2 from './sample-configs/simple_tab_2.json';
import simpleTable1 from './sample-configs/simple_table_1.json';
import simpleTable2 from './sample-configs/simple_table_2.json';
import simpleTable2updated from './sample-configs/simple_table_2_updated.json';
import simpleTable3 from './sample-configs/simple_table_3.json';

@Component({
  selector: 'namnguyen191-dui-consumer',
  standalone: true,
  imports: [CommonModule, DuiComponent],
  templateUrl: './dui-consumer.component.html',
  styleUrl: './dui-consumer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiConsumerComponent {
  layoutId: WritableSignal<string> = signal(mainLayout.id);

  uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  remoteResourceService: RemoteResourceService = inject(RemoteResourceService);
  eventsService: EventsService = inject(EventsService);
  layoutService: LayoutService = inject(LayoutService);

  constructor() {
    this.uiElementTemplatesService.registerUIElementTemplate(simpleTable1);

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
    this.eventsService.getEvents().subscribe((event) => {
      if (event.type === 'MISSING_UI_ELEMENT_TEMPLATE') {
        if (event.payload.id === 'MY_SIMPLE_TABLE_2') {
          this.uiElementTemplatesService.registerUIElementTemplate(simpleTable2);
        }

        if (event.payload.id === 'MY_SIMPLE_TABLE_V2') {
          this.uiElementTemplatesService.registerUIElementTemplate(simpleTableV2);
        }

        if (event.payload.id === 'MY_SIMPLE_TABLE_3') {
          this.uiElementTemplatesService.registerUIElementTemplate(simpleTable3);
        }

        if (event.payload.id === 'MY_SIMPLE_BUTTON_1') {
          this.uiElementTemplatesService.registerUIElementTemplate(simpleButton1);
        }

        if (event.payload.id === 'MY_SIMPLE_TAB_1') {
          this.uiElementTemplatesService.registerUIElementTemplate(tabs1);
        }

        if (event.payload.id === 'MY_SIMPLE_TAB_2') {
          this.uiElementTemplatesService.registerUIElementTemplate(tabs2);
        }
      }

      if (event.type === 'MISSING_REMOTE_RESOURCE') {
        if (event.payload.id === '123') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.remoteResourceService.registerRemoteResource(boredResource as any);
        }
      }

      if (event.type === 'UI_ELEMENT_REPOSITION') {
        console.log(event);
      }

      if (event.type === 'MISSING_LAYOUT') {
        const missingLayoutId = event.payload.id;
        switch (missingLayoutId) {
          case mainLayout.id: {
            this.layoutService.registerLayout(mainLayout);
            break;
          }
          case testLayout.id: {
            this.layoutService.registerLayout(testLayout);
            break;
          }
          case testLayout2.id: {
            this.layoutService.registerLayout(testLayout2);
            break;
          }
          default:
            console.error('Unknown layout with id: ', missingLayoutId);
        }
      }
    });
  }

  private _testChangingTemplateAndElement(): void {
    console.log(
      `------------------- Before setting layout to: ${testLayout.id} -------------------`
    );
    this.layoutId.set(testLayout.id);
    setTimeout(() => {
      console.log(
        `------------------- Before setting layout to: ${testLayout2.id} -------------------`
      );
      this.layoutId.set(testLayout2.id);
      setTimeout(() => {
        console.log(
          `------------------- Before update ui element for: ${simpleTable2updated.id} -------------------`
        );
        this.uiElementTemplatesService.updateUIElementTemplate(simpleTable2updated);

        setTimeout(() => {
          console.log(
            `------------------- Before setting layout to: ${testLayout.id} -------------------`
          );
          this.layoutId.set(testLayout.id);
        }, 5000);
      }, 5000);
    }, 5000);
  }
}
