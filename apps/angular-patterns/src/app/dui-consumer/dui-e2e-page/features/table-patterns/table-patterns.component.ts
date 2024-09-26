import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { DjuiComponent } from '@dj-ui/core';

@Component({
  selector: 'namnguyen191-table-patterns',
  standalone: true,
  imports: [CommonModule, DjuiComponent],
  templateUrl: './table-patterns.component.html',
  styleUrl: './table-patterns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePatternsComponent {
  layoutId: WritableSignal<string> = signal('LAYOUT_CARBON_MAIN');
}
