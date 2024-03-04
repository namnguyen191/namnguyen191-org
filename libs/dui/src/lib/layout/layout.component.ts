import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { LayoutConfig } from '../interfaces/Layout';
import { UiElementWrapperComponent } from './ui-element-wrapper/ui-element-wrapper.component';

@Component({
  selector: 'namnguyen191-layout',
  standalone: true,
  imports: [CommonModule, UiElementWrapperComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  layoutConfig: InputSignal<LayoutConfig> = input.required<LayoutConfig>();
}
