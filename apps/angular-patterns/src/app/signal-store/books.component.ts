import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';

import { Book } from './books.service';
import { BooksStore } from './books.store';

export function isObject(val: unknown): val is object {
  return typeof val === 'object';
}

@Component({
  selector: 'namnguyen191-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooksComponent {
  readonly #booksStore = inject(BooksStore);

  allBooksSig: Signal<Book[]> = this.#booksStore.entities;
  resourceState = this.#booksStore.requestStatus;

  isObject = isObject;

  constructor() {
    const test = this.resourceState();
    if (typeof test === 'object') {
      test.error;
    }
  }
}
