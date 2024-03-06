import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { UIElementImplementation } from '../../interfaces/UIElement';

export type SimpleTableUIElementComponentConfigs = {
  text: string;
};

@Component({
  selector: 'namnguyen191-simple-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simple-table.component.html',
  styleUrl: './simple-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleTableComponent
  implements UIElementImplementation<SimpleTableUIElementComponentConfigs>
{
  static readonly ELEMENT_TYPE = 'SIMPLE_TABLE';

  isLoadingConfigOption: InputSignal<boolean> = input(false);
  textConfigOption: InputSignal<string> = input('No text');
}
