import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  OnDestroy,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { LayoutComponent } from '../layout/layout.component';
import { LayoutService } from '../services';

@Component({
  selector: 'namnguyen191-dui',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  templateUrl: './dui.component.html',
  styleUrl: './dui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiComponent implements OnDestroy {
  #layoutService: LayoutService = inject(LayoutService);
  #cancelLayoutSubscriptionSubject = new Subject<void>();
  #destroyRef = new Subject<void>();

  layoutId: InputSignal<string> = input.required<string>();

  layoutConfig = computed(() => {
    // Cancel previous layout subscription
    this.#cancelLayoutSubscriptionSubject.next();
    const layoutId = this.layoutId();
    const layoutConfigObs = this.#layoutService.getLayout(layoutId);

    return layoutConfigObs.pipe(
      takeUntil(this.#cancelLayoutSubscriptionSubject),
      takeUntil(this.#destroyRef)
    );
  });

  ngOnDestroy(): void {
    this.#cancelLayoutSubscriptionSubject.next();
    this.#cancelLayoutSubscriptionSubject.complete();
    this.#destroyRef.next();
    this.#destroyRef.complete();
  }
}
