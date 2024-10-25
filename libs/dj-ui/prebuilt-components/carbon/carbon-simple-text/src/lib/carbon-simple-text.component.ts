import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import {
  CarbonSimpleTextElementType,
  CarbonSimpleTextSymbol,
} from '@dj-ui/carbon-components/shared';
import { BaseUIElementComponent, UIElementImplementation } from '@dj-ui/core';
import { parseZodWithDefault } from '@namnguyen191/types-helper';

import {
  SimpleTextConfigs,
  TextConfigOption,
  ZTextConfigOption,
} from './carbon-simple-text.interface';

@Component({
  selector: 'dj-ui-carbon-simple-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carbon-simple-text.component.html',
  styleUrl: './carbon-simple-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarbonSimpleTextComponent
  extends BaseUIElementComponent
  implements UIElementImplementation<SimpleTextConfigs>
{
  static override readonly ELEMENT_TYPE = CarbonSimpleTextElementType;
  static override readonly ELEMENT_SYMBOL = CarbonSimpleTextSymbol;

  override getElementType(): string {
    return CarbonSimpleTextComponent.ELEMENT_TYPE;
  }

  override getSymbol(): symbol {
    return CarbonSimpleTextComponent.ELEMENT_SYMBOL;
  }

  readonly #defaulText = 'Default text';
  textConfigOption: InputSignal<TextConfigOption> = input(this.#defaulText, {
    alias: 'text',
    transform: (val) =>
      parseZodWithDefault<TextConfigOption>(ZTextConfigOption, val, this.#defaulText),
  });
}
