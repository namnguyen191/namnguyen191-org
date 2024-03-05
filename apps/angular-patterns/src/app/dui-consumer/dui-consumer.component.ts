import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  DuiComponent,
  LayoutConfig,
  RemoteResourceService,
  SimpleTableComponent,
  UIElementFactoryService,
  UIElementTemplatesService,
} from '@namnguyen191/dui';

import testLayout from './sample-configs/layout-1.json';

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

  constructor() {
    this.uiElementTemplatesService.registerUIElementTemplate({
      id: 'MY_SIMPLE_TABLE',
      type: SimpleTableComponent.ELEMENT_TYPE,
      remoteResourceId: '123',
      options: {
        textConfigOption: 'Hello world',
      },
    });

    this.uiElementFactoryService.registerUIElement(
      SimpleTableComponent.ELEMENT_TYPE,
      SimpleTableComponent
    );

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
}
