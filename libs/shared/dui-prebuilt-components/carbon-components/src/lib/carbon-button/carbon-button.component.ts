import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  inject,
  input,
  InputSignal,
  runInInjectionContext,
} from '@angular/core';
import {
  ActionHook,
  BaseUIElementWithContextComponent,
  ContextBasedActionHooks,
  interpolateAndTriggerContextBasedActionHooks,
  parseZodWithDefault,
  UIElementImplementation,
} from '@namnguyen191/dui';
import { ButtonModule, InlineLoadingModule } from 'carbon-components-angular';

import {
  ButtonTypeConfig,
  CarbonButtonUIElementComponentConfigs,
  ZodCarbonButtonUIElementComponentConfigs,
} from './carbon-button.interface';

@Component({
  selector: 'lib-carbon-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, InlineLoadingModule],
  templateUrl: './carbon-button.component.html',
  styleUrl: './carbon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarbonButtonComponent
  extends BaseUIElementWithContextComponent
  implements UIElementImplementation<CarbonButtonUIElementComponentConfigs>
{
  static readonly NEED_CONTEXT = true;
  static readonly ELEMENT_TYPE = 'CARBON_BUTTON';

  defaultText = 'Default text';
  textConfigOption: InputSignal<string> = input(this.defaultText, {
    alias: 'text',
    transform: (val) =>
      parseZodWithDefault(
        ZodCarbonButtonUIElementComponentConfigs.shape.text,
        val,
        this.defaultText
      ),
  });

  defaultButtonType: ButtonTypeConfig = 'primary';
  typeConfigOption: InputSignal<ButtonTypeConfig> = input(this.defaultButtonType, {
    alias: 'type',
    transform: (val) =>
      parseZodWithDefault(
        ZodCarbonButtonUIElementComponentConfigs.shape.type,
        val,
        this.defaultButtonType
      ),
  });

  onClickConfigOption: InputSignal<ContextBasedActionHooks> = input([] as ContextBasedActionHooks, {
    alias: 'onClick',
    transform: (val) =>
      parseZodWithDefault(ZodCarbonButtonUIElementComponentConfigs.shape.onClick, val, []),
  });

  readonly #environmentInjector = inject(EnvironmentInjector);

  onClick(): void {
    const onClickHooks: ActionHook[] | undefined | string = this.onClickConfigOption();

    if (!onClickHooks) {
      return;
    }

    const context = {
      ...this.$context$(),
    };

    runInInjectionContext(this.#environmentInjector, async () => {
      await interpolateAndTriggerContextBasedActionHooks({
        hooks: onClickHooks,
        context,
      });
    });
  }
}
