import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { LayoutConfig } from '../interfaces/Layout';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'namnguyen191-dui',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './dui.component.html',
  styleUrl: './dui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiComponent {
  layoutConfig: InputSignal<LayoutConfig> = input.required<LayoutConfig>();
}
