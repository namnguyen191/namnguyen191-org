import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal, output } from '@angular/core';
import {
  CarbonButtonElementType,
  CarbonButtonSymbol,
} from '@namnguyen191/dui-carbon-components/shared';
import { BaseUIElementComponent, UIElementImplementation } from '@namnguyen191/dui-core';
import { parseZodWithDefault } from '@namnguyen191/types-helper';
import { ButtonModule, InlineLoadingModule } from 'carbon-components-angular';

import {
  ButtonTypeConfig,
  CarbonButtonUIElementComponentConfigs,
  CarbonButtonUIElementComponentEvents,
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
  extends BaseUIElementComponent
  implements
    UIElementImplementation<
      CarbonButtonUIElementComponentConfigs,
      CarbonButtonUIElementComponentEvents
    >
{
  static override readonly ELEMENT_TYPE = CarbonButtonElementType;
  static override readonly ELEMENT_SYMBOL = CarbonButtonSymbol;

  override getElementType(): string {
    return CarbonButtonComponent.ELEMENT_TYPE;
  }

  override getSymbol(): symbol {
    return CarbonButtonComponent.ELEMENT_SYMBOL;
  }

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

  buttonClicked = output<void>();

  onClick(): void {
    this.buttonClicked.emit();
  }
}
