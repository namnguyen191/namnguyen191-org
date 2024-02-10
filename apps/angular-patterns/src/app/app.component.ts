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
import { RouterModule } from '@angular/router';

import { getSomethingFun } from '../helper/api';
import { getSuperSecretQueryParam } from '../helper/query-params';

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule],
  selector: 'namnguyen191-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  injector: EnvironmentInjector = inject(EnvironmentInjector);

  funText: WritableSignal<string> = signal('Generating fun text ...');
  secretText$ = getSuperSecretQueryParam();

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      getSomethingFun().subscribe((val) => this.funText.set(val));
    });
  }
}
