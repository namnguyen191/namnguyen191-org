import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { setupDefault } from '@dj-ui/common';
import { ActionHookService } from '@dj-ui/core';
import { NotificationModule, ThemeModule, ToastContent } from 'carbon-components-angular';

@Component({
  selector: 'namnguyen191-dui-e2e-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationModule, ThemeModule],
  templateUrl: './dui-e2e-page.component.html',
  styleUrl: './dui-e2e-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuiE2EPageComponent {
  readonly #actionHookService = inject(ActionHookService);

  isNotificationDisplayed = signal<boolean>(false);
  notificationConfig: ToastContent = {
    type: 'info',
    title: 'Custom hook toast',
    subtitle: 'This toast was triggered by a custom hook',
    caption:
      'Testing custom action hook by registering a hook that open this toast. If you are seeing this toast then it is working',
    showClose: true,
  };

  constructor() {
    setupDefault();
    this.#actionHookService.registerHook({
      hookId: 'showTestNotification',
      handler: () => this.#showNotification(),
    });
  }

  #showNotification(): void {
    this.isNotificationDisplayed.set(true);
  }
}
