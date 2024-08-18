import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  inject,
  OnInit,
  runInInjectionContext,
  signal,
  WritableSignal,
} from '@angular/core';

import { getSomethingFun } from '../../helper/api';
import { getSuperSecretQueryParam } from '../../helper/query-params';

@Component({
  selector: 'namnguyen191-injector-function',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './injector-function.component.html',
  styleUrl: './injector-function.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InjectorFunctionComponent implements OnInit {
  readonly #injector = inject(EnvironmentInjector);

  funText: WritableSignal<string> = signal('Generating fun text ...');
  secretText$ = getSuperSecretQueryParam();

  ngOnInit(): void {
    runInInjectionContext(this.#injector, () => {
      getSomethingFun().subscribe((val) => this.funText.set(val));
    });
  }
}
