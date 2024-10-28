import {
  Directive,
  input,
  InputSignal,
  InputSignalWithTransform,
  OutputEmitterRef,
} from '@angular/core';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | InputSignalWithTransform<any, TConfigs[K]>;
}>;

export type UIElementRequiredInputOptions = CreateUIElementInputOptions<UIElementRequiredConfigs>;

export type UIElementRequiredInputs = {
  [K in keyof UIElementRequiredConfigs as K extends string ? `${K}ConfigOption` : never]:
    | UIElementRequiredConfigs[K]
    | Observable<UIElementRequiredConfigs[K]>;
};

type CreateUIElementEventsOutputs<TEvents extends ObjectType> = Required<{
  [K in keyof TEvents]: OutputEmitterRef<TEvents[K]>;
}>;

export type UIElementImplementation<
  TConfigs extends ObjectType,
  TEvents extends ObjectType = NonNullable<unknown>,
> = UIElementRequiredInputOptions &
  CreateUIElementInputOptions<TConfigs> &
  CreateUIElementEventsOutputs<TEvents>;

const defaultElementSymbol = Symbol('Default element');

@Directive()
export abstract class BaseUIElementComponent
  implements UIElementImplementation<UIElementRequiredConfigs>
{
  static readonly ELEMENT_TYPE: string = 'DEFAULT_ABSTRACT_COMPONENT';
  static readonly ELEMENT_SYMBOL: symbol = defaultElementSymbol;

  getElementType(): string {
    return 'DEFAULT TYPE';
  }

  getSymbol(): symbol {
    return defaultElementSymbol;
  }

  isErrorConfigOption: InputSignal<boolean> = input(false, {
    alias: 'isError',
    transform: (val) => ZodIsError.parse(val),
  });

  isLoadingConfigOption: InputSignal<boolean> = input(false, {
    alias: 'isLoading',
    transform: (val) => ZodIsLoading.parse(val),
  });
}
