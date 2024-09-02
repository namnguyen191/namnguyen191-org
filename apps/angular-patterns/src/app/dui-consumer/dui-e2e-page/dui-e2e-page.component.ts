import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { setupDefaultDUI } from '@namnguyen191/dui-common';
import { ActionHookService } from '@namnguyen191/dui-core';
import { NotificationModule, ToastContent } from 'carbon-components-angular';

@Component({
  selector: 'namnguyen191-dui-e2e-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationModule],
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
    setupDefaultDUI();
    this.#actionHookService.registerHook({
      hookId: 'showTestNotification',
      handler: () => this.#showNotification(),
    });
  }

  #showNotification(): void {
    this.isNotificationDisplayed.set(true);
  }
}
