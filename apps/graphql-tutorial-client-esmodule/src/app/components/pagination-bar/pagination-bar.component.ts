import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'namnguyen191-pagination-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination-bar.component.html',
  styleUrl: './pagination-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationBarComponent {}
