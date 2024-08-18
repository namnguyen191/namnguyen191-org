import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { LazyLoadedService } from '../services/lazy-loaded-service.service';

@Component({
  selector: 'namnguyen191-lazy-loaded-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lazy-loaded-service.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyLoadedServiceComponent implements OnInit {
  readonly #lazyLoadedService = inject(LazyLoadedService);

  ngOnInit(): void {
    this.#lazyLoadedService.sayHello();
  }
}
