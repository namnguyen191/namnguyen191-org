import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  DataFetcherUIElementComponent,
  DuiComponent,
  LayoutConfig,
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

  constructor() {
    this.uiElementTemplatesService.registerUIElementTemplate({
      id: 'MY_DATA_FETCHER',
      type: DataFetcherUIElementComponent.ELEMENT_TYPE,
    });

    this.uiElementFactoryService.registerUIElement(
      DataFetcherUIElementComponent.ELEMENT_TYPE,
      DataFetcherUIElementComponent
    );
  }
}
