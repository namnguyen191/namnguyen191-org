import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'djui',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './dj-ui.component.html',
  styleUrl: './dj-ui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DjuiComponent {
  layoutId: InputSignal<string> = input.required<string>();
}
