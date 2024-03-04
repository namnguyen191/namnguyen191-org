import { Component, input, InputSignal } from '@angular/core';

import { UIElementImplementation, UIElementInstance } from '../interfaces/UIElement';

export type UIElementComponentConfigs = UIElementInstance;

@Component({
  template: '',
})
export class BaseUIElementComponent implements UIElementImplementation<UIElementComponentConfigs> {
  static readonly ELEMENT_TYPE: string = 'BASE';
  uiElementTemplateIdConfigOption: InputSignal<string> = input.required();
  idConfigOption: InputSignal<string> = input.required();
}
