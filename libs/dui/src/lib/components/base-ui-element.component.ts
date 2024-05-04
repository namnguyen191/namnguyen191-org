import { Component, input, InputSignal } from '@angular/core';

import { UIElementImplementation } from '../interfaces';
import { ZodIsError, ZodIsLoading } from '../utils/zod-types';

@Component({
  selector: 'namnguyen191-abstract-base-ui-element',
  template: '',
})
export abstract class BaseUIElementComponent implements UIElementImplementation {
  isErrorConfigOption: InputSignal<boolean> = input(false, {
    alias: 'isError',
    transform: (val) => ZodIsError.parse(val),
  });

  isLoadingConfigOption: InputSignal<boolean> = input(false, {
    alias: 'isLoading',
    transform: (val) => ZodIsLoading.parse(val),
  });
}
