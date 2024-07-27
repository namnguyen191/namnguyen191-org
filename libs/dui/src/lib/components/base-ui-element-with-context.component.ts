import { Component, input, InputSignal } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';

import { JSRunnerContext } from '../web-worker-helpers';
import { BaseUIElementComponent } from './base-ui-element.component';

@Component({
  selector: 'namnguyen191-abstract-base-ui-element',
  template: '',
})
export abstract class BaseUIElementWithContextComponent extends BaseUIElementComponent {
  // Cannot use [ComponentContextPropertyKey] otherwise Angular won't detect it as an input
  $context$: InputSignal<ObjectType> = input<JSRunnerContext>({});
}
