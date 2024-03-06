import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  DuiComponent,
  EventsService,
  LayoutConfig,
  RemoteResourceService,
  SimpleTableComponent,
  UIElementFactoryService,
  UIElementTemplatesService,
} from '@namnguyen191/dui';
import { asapScheduler } from 'rxjs';

import testLayout from './sample-configs/layout-1.json';
import simpleTable1 from './sample-configs/simple_table_1.json';
import simpleTable2 from './sample-configs/simple_table_2.json';

@Component({
  selector: 'namnguyen191-dui-consumer',
  standalone: true,
  imports: [CommonModule, DuiComponent],
  templateUrl: './dui-consumer.component.html',
  styleUrl: './dui-consumer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiConsumerComponent {
  layout = testLayout as LayoutConfig;

  uiElementTemplatesService: UIElementTemplatesService = inject(UIElementTemplatesService);
  uiElementFactoryService: UIElementFactoryService = inject(UIElementFactoryService);
  remoteResourceService: RemoteResourceService = inject(RemoteResourceService);
  eventsService: EventsService = inject(EventsService);

  constructor() {
    this.setupEventsListener();
    this.uiElementTemplatesService.registerUIElementTemplate(simpleTable1);

    this.uiElementFactoryService.registerUIElement({
      type: SimpleTableComponent.ELEMENT_TYPE,
      component: SimpleTableComponent,
    });

    this.remoteResourceService.registerRemoteResource({
      id: '123',
      requests: [
        {
          endpoint: 'https://www.boredapi.com/api/activity',
          method: 'GET',
        },
      ],
    });
  }

  setupEventsListener(): void {
    this.eventsService.getEvents().subscribe((event) => {
      console.log('Nam data is: ', event);
      if (event.type === 'MISSING_UI_ELEMENT_TEMPLATE') {
        asapScheduler.schedule(
          () => this.uiElementTemplatesService.registerUIElementTemplate(simpleTable2),
          2000
        );
      }
    });
  }
}
