import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { CarbonTextCardComponent } from '@namnguyen191/dui-carbon-components';
import { DuiComponent, UIElementFactoryService } from '@namnguyen191/dui-core';

@Component({
  selector: 'namnguyen191-text-card-patterns',
  standalone: true,
  imports: [DuiComponent],
  templateUrl: './text-card-patterns.component.html',
  styleUrl: './text-card-patterns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextCardPatternsComponent {
  layoutId: WritableSignal<string> = signal('carbon_simple_text_card_layout');

  #uiElementFactoryService = inject(UIElementFactoryService);

  constructor() {
    this.#uiElementFactoryService.registerUIElement({
      type: CarbonTextCardComponent.ELEMENT_TYPE,
      component: CarbonTextCardComponent,
    });
  }
}
