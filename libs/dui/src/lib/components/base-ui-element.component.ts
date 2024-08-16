import { Component, input, InputSignal, InputSignalWithTransform } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { Observable } from 'rxjs';
import { z } from 'zod';

export const ZodIsLoading = z.boolean({
  invalid_type_error: 'loading state must be a boolean',
});

export const ZodIsError = z.boolean({
  invalid_type_error: 'error state must be a boolean',
});

export type UIElementRequiredConfigs = {
  isLoading: boolean;
  isError: boolean;
};

type CreateUIElementInputOptions<TConfigs> = Required<{
  [K in keyof TConfigs as K extends string ? `${K}ConfigOption` : never]:
    | InputSignal<TConfigs[K]>
    | InputSignalWithTransform<TConfigs[K], unknown>;
}>;

export type UIElementRequiredInputOptions = CreateUIElementInputOptions<UIElementRequiredConfigs>;

export type UIElementRequiredInputs = {
  [K in keyof UIElementRequiredConfigs as K extends string ? `${K}ConfigOption` : never]:
    | UIElementRequiredConfigs[K]
    | Observable<UIElementRequiredConfigs[K]>;
};

export type UIElementImplementation<TConfigs extends ObjectType> = UIElementRequiredInputOptions &
  CreateUIElementInputOptions<TConfigs>;

@Component({
  selector: 'namnguyen191-abstract-base-ui-element',
  template: '',
})
export abstract class BaseUIElementComponent
  implements UIElementImplementation<UIElementRequiredConfigs>
{
  isErrorConfigOption: InputSignal<boolean> = input(false, {
    alias: 'isError',
    transform: (val) => ZodIsError.parse(val),
  });

  isLoadingConfigOption: InputSignal<boolean> = input(false, {
    alias: 'isLoading',
    transform: (val) => ZodIsLoading.parse(val),
  });
}
