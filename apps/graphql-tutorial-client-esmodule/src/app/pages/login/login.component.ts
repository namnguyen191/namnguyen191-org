import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'namnguyen191-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly #environmentInjector = inject(EnvironmentInjector);
  readonly #authService = inject(AuthService);

  loginFormModel = {
    email: '',
    password: '',
  };
  isLoggingIn = signal<boolean>(false);
  isError = signal<boolean>(false);

  handleSubmit(): void {
    runInInjectionContext(this.#environmentInjector, async () => {
      try {
        this.isLoggingIn.set(true);
        await this.#authService.login(this.loginFormModel);
        this.isError.set(false);
        // this.router.navigateByUrl(`/jobs/${job.id}`);
      } catch (err) {
        console.warn(err);
        this.isError.set(true);
      } finally {
        this.isLoggingIn.set(false);
      }
    });
  }
}
