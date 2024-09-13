import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, InputSignal } from '@angular/core';
import { CarbonTextCardSymbol } from '@namnguyen191/dui-carbon-components/shared';
import { EmitOnClickDirective } from '@namnguyen191/dui-common';
import { BaseUIElementComponent, UIElementImplementation } from '@namnguyen191/dui-core';
import { parseZodWithDefault } from '@namnguyen191/types-helper';

import {
  AvatarUrlConfigOption,
  BodyConfigOption,
  ClickableConfigOption,
  ImageUrlConfigOption,
  SubTitleConfigOption,
  TextCardConfigs,
  TextCardEvents,
  TitleConfigOption,
  ZBodyConfigOption,
  ZClickableConfigOption,
  ZImageUrlConfigOption,
  ZSubTitleConfigOption,
  ZTitleConfigOption,
} from './carbon-text-card.interface';

@Component({
  selector: 'namnguyen191-carbon-text-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carbon-text-card.component.html',
  styleUrl: './carbon-text-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [EmitOnClickDirective],
  host: {
    '[class.clickable]': 'clickableConfigOption()',
  },
})
export class CarbonTextCardComponent
  extends BaseUIElementComponent
  implements UIElementImplementation<TextCardConfigs, TextCardEvents>
{
  static override readonly ELEMENT_TYPE = 'CARBON_TEXT_CARD';
  static override readonly ELEMENT_SYMBOL = CarbonTextCardSymbol;

  override getElementType(): string {
    return CarbonTextCardComponent.ELEMENT_TYPE;
  }

  override getSymbol(): symbol {
    return CarbonTextCardComponent.ELEMENT_SYMBOL;
  }

  readonly #defaultTitle = 'Default card title';
  titleConfigOption: InputSignal<TitleConfigOption> = input(this.#defaultTitle, {
    alias: 'title',
    transform: (val) =>
      parseZodWithDefault<TitleConfigOption>(ZTitleConfigOption, val, this.#defaultTitle),
  });

  subTitleConfigOption: InputSignal<SubTitleConfigOption> = input('', {
    alias: 'subTitle',
    transform: (val) => parseZodWithDefault<SubTitleConfigOption>(ZSubTitleConfigOption, val, ''),
  });

  avatarUrlConfigOption: InputSignal<AvatarUrlConfigOption> = input('', {
    alias: 'avatarUrl',
    transform: (val) => parseZodWithDefault<AvatarUrlConfigOption>(ZSubTitleConfigOption, val, ''),
  });

  imageUrlConfigOption: InputSignal<ImageUrlConfigOption> = input('', {
    alias: 'imageUrl',
    transform: (val) => parseZodWithDefault<ImageUrlConfigOption>(ZImageUrlConfigOption, val, ''),
  });

  readonly #defaultBody = 'Default card body';
  bodyConfigOption: InputSignal<BodyConfigOption> = input(this.#defaultBody, {
    alias: 'body',
    transform: (val) =>
      parseZodWithDefault<BodyConfigOption>(ZBodyConfigOption, val, this.#defaultTitle),
  });

  readonly #defaultClickable = false;
  clickableConfigOption: InputSignal<ClickableConfigOption> = input(this.#defaultClickable, {
    alias: 'clickable',
    transform: (val) =>
      parseZodWithDefault<ClickableConfigOption>(
        ZClickableConfigOption,
        val,
        this.#defaultClickable
      ),
  });

  onCardClicked = inject(EmitOnClickDirective).onHostClicked;
}
