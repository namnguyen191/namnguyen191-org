import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';

@Component({
  selector: 'namnguyen191-page-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-button.component.html',
  styleUrl: './page-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageButtonComponent {
  page: InputSignal<string> = input.required<string>();
  currentPage: InputSignal<string> = input.required<string>();
}
