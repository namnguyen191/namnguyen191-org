import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import {
  DuiComponent,
  EventsService,
  LayoutConfig,
  RemoteResourceService,
  SimpleTableComponent,
  UIElementFactoryService,
  UIElementTemplatesService,
} from '@namnguyen191/dui';

import boredResource from './sample-configs/boredapi-remote-resource.json';
import testLayout from './sample-configs/layout-1.json';
import testLayout2 from './sample-configs/layout-2.json';
import mainLayout from './sample-configs/main-layout.json';
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
  layout: WritableSignal<LayoutConfig> = signal(mainLayout);

  uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  remoteResourceService: RemoteResourceService = inject(RemoteResourceService);
  eventsService: EventsService = inject(EventsService);

  constructor() {
    this.uiElementTemplatesService.registerUIElementTemplate(simpleTable1);

    this.setupEventsListener();

    this.uiElementFactoryService.registerUIElement({
      type: SimpleTableComponent.ELEMENT_TYPE,
      component: SimpleTableComponent,
    });

    // this._testChangingTemplateAndElement();
  }

  setupEventsListener(): void {
    this.eventsService.getEvents().subscribe((event) => {
      if (event.type === 'MISSING_UI_ELEMENT_TEMPLATE') {
        if (event.payload.id === 'MY_SIMPLE_TABLE_2') {
          this.uiElementTemplatesService.registerUIElementTemplate(simpleTable2);
        }

        if (event.payload.id === 'MY_SIMPLE_TABLE_3') {
          this.uiElementTemplatesService.registerUIElementTemplate(simpleTable3);
        }
      }

      if (event.type === 'MISSING_REMOTE_RESOURCE') {
        if (event.payload.id === '123') {
          this.remoteResourceService.registerRemoteResource(boredResource);
        }
      }
    });
  }

  private _testChangingTemplateAndElement(): void {
    this.layout.set(testLayout);
    setTimeout(() => {
      this.layout.set(testLayout2);
      setTimeout(() => {
        this.uiElementTemplatesService.updateUIElementTemplate(simpleTable2updated);

        setTimeout(() => {
          this.layout.set(testLayout);
        }, 5000);
      }, 5000);
    }, 5000);
  }
}
