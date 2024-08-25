import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { DuiComponent } from '@namnguyen191/dui-core';

@Component({
  selector: 'namnguyen191-table-patterns',
  standalone: true,
  imports: [CommonModule, DuiComponent],
  templateUrl: './table-patterns.component.html',
  styleUrl: './table-patterns.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablePatternsComponent {
  layoutId: WritableSignal<string> = signal('LAYOUT_CARBON_MAIN');
}
