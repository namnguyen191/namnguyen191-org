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
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  BaseUIElementComponent,
  triggerMultipleUIActions,
  UICommAction,
  UIElementImplementation,
  ZodUICommAction,
} from '@namnguyen191/dui';
import { z } from 'zod';

const ZodButtonColor = z.enum(['primary', 'accent', 'warn'], {
  errorMap: () => {
    return { message: 'Button color must be one of the following: "primary", "accent", or "warn"' };
  },
});
export type ButtonColor = z.infer<typeof ZodButtonColor>;

const ZodSimpleButtonUIElementComponentConfigs = z.object({
  text: z.string({
    invalid_type_error: 'Button text must be a string',
  }),
  color: ZodButtonColor,
  disabled: z.boolean(),
  onClick: z.array(ZodUICommAction),
});

export type SimpleButtonUIElementComponentConfigs = z.infer<
  typeof ZodSimpleButtonUIElementComponentConfigs
>;

@Component({
  selector: 'namnguyen191-simple-button',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './simple-button.component.html',
  styleUrl: './simple-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleButtonComponent
  extends BaseUIElementComponent
  implements UIElementImplementation<SimpleButtonUIElementComponentConfigs>
{
  static readonly ELEMENT_TYPE = 'SIMPLE_BUTTON';

  textConfigOption: InputSignal<string> = input('Default button text', {
    alias: 'text',
    transform: (val) => ZodSimpleButtonUIElementComponentConfigs.shape.text.parse(val),
  });

  disabledConfigOption: InputSignal<boolean> = input(false, {
    alias: 'disabled',
    transform: (val) => ZodSimpleButtonUIElementComponentConfigs.shape.disabled.parse(val),
  });

  colorConfigOption: InputSignal<ButtonColor> = input('primary', {
    alias: 'color',
    transform: (val) => ZodSimpleButtonUIElementComponentConfigs.shape.color.parse(val),
  });

  onClickConfigOption: InputSignal<UICommAction[]> = input([], {
    alias: 'onClick',
    transform: (val) => ZodSimpleButtonUIElementComponentConfigs.shape.onClick.parse(val),
  });

  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  handleButtonClick(): void {
    const onclickActions = this.onClickConfigOption();
    if (onclickActions.length > 0) {
      runInInjectionContext(this.#environmentInjector, () =>
        triggerMultipleUIActions(onclickActions)
      );
    }
  }
}
