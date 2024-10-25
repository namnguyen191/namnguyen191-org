import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { DjuiComponent } from '@dj-ui/core';

@Component({
  selector: 'namnguyen191-simple-text-patterns',
  standalone: true,
  imports: [DjuiComponent],
  templateUrl: './simple-text-patterns.component.html',
  styleUrl: './simple-text-patterns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleTextPatternsComponent {
  layoutId: WritableSignal<string> = signal('carbon_simple_text_test_layout');
}
