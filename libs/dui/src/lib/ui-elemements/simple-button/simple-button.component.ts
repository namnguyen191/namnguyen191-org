import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  inject,
  input,
  InputSignalWithTransform,
  runInInjectionContext,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { first, Observable, of } from 'rxjs';
import { z } from 'zod';

import { UICommAction, ZodUICommAction } from '../../interfaces';
import { UIElementImplementation } from '../../interfaces/UIElement';
import { triggerMultipleUIActions } from '../../services/hooks/UIActions';
import { inputObsTransform } from '../../utils/helper';
import { ZodIsLoading } from '../../utils/zod-types';

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
  implements UIElementImplementation<SimpleButtonUIElementComponentConfigs>
{
  static readonly ELEMENT_TYPE = 'SIMPLE_BUTTON';

  isLoadingConfigOption: InputSignalWithTransform<
    Observable<boolean>,
    boolean | Observable<boolean>
  > = input(of(false), {
    alias: 'isLoading',
    transform: inputObsTransform(ZodIsLoading),
  });

  textConfigOption: InputSignalWithTransform<Observable<string>, string | Observable<string>> =
    input(of('Default button text'), {
      alias: 'text',
      transform: inputObsTransform(ZodSimpleButtonUIElementComponentConfigs.shape.text),
    });

  disabledConfigOption: InputSignalWithTransform<
    Observable<boolean>,
    boolean | Observable<boolean>
  > = input(of(false), {
    alias: 'disabled',
    transform: inputObsTransform(ZodSimpleButtonUIElementComponentConfigs.shape.disabled),
  });

  colorConfigOption: InputSignalWithTransform<
    Observable<ButtonColor>,
    ButtonColor | Observable<ButtonColor>
  > = input(of('primary'), {
    alias: 'color',
    transform: inputObsTransform(ZodSimpleButtonUIElementComponentConfigs.shape.color),
  });

  onClickConfigOption: InputSignalWithTransform<
    Observable<UICommAction[]>,
    UICommAction[] | Observable<UICommAction[]>
  > = input(of([]), {
    alias: 'onClick',
    transform: inputObsTransform(ZodSimpleButtonUIElementComponentConfigs.shape.onClick),
  });

  #environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);

  handleButtonClick(): void {
    this.onClickConfigOption()
      .pipe(first())
      .subscribe((dispatchableActions) =>
        runInInjectionContext(this.#environmentInjector, () =>
          triggerMultipleUIActions(dispatchableActions)
        )
      );
  }
}
