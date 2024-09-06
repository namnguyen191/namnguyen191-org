import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { DuiComponent } from '@namnguyen191/dui-core';

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
}
