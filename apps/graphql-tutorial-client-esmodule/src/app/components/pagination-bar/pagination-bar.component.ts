import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { PageButtonComponent } from '../page-button/page-button.component';

@Component({
  selector: 'namnguyen191-pagination-bar',
  standalone: true,
  imports: [CommonModule, PageButtonComponent],
  templateUrl: './pagination-bar.component.html',
  styleUrl: './pagination-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationBarComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pages = computed(() => {
    return this.getVisiblePages(this.currentPage(), this.totalPages());
  });

  pageSelect = output<number>();

  setPage(newPage: number): void {
    this.pageSelect.emit(newPage);
  }

  /**
   * Calculates a list of at most 7 pages to display.
   * Always includes the current, previous, next, first
   * and last ones if available.
   *
   * @returns an array with the page numbers to display.
   * It can include the special `'<'` and `'>'` elements
   * to represent skipped pages.
   *
   * @example
   * getVisiblePages(4, 5) // => [1, 2, 3, 4, 5]
   * getVisiblePages(4, 8) // => [1, 2, 3, 4, 5, '>', 8]
   * getVisiblePages(5, 8) // => [1, '<', 4, 5, 6, 7, 8]
   * getVisiblePages(5, 10) // => [1, '<', 4, 5, 6, '>', 10]
   */
  getVisiblePages(current: number, total: number): string[] {
    if (total <= 7) {
      return this.range(total);
    }
    if (current < 5) {
      return [...this.range(5), '>', total.toString()];
    }
    if (current > total - 4) {
      return ['1', '<', ...this.range(5, total - 4)];
    }
    return [
      '1',
      '<',
      (current - 1).toString(),
      current.toString(),
      (current + 1).toString(),
      '>',
      total.toString(),
    ];
  }

  range(count: number, start = 1): string[] {
    return Array.from(new Array(count), (x, i) => (i + start).toString());
  }
}
