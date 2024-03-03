import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'namnguyen191-dui',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dui.component.html',
  styleUrl: './dui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiComponent {}
