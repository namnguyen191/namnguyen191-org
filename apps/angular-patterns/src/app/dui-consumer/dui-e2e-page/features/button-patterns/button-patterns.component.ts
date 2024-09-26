import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { DjuiComponent } from '@dj-ui/core';

@Component({
  selector: 'namnguyen191-button-patterns',
  standalone: true,
  imports: [CommonModule, DjuiComponent],
  templateUrl: './button-patterns.component.html',
  styleUrl: './button-patterns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPatternsComponent {
  layoutId: WritableSignal<string> = signal('LAYOUT_CARBON_TEST_SIMPLE_BUTTON');
}
