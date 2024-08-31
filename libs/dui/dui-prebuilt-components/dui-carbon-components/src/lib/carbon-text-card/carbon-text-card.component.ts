import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { BaseUIElementComponent, UIElementImplementation } from '@namnguyen191/dui-core';
import { parseZodWithDefault } from '@namnguyen191/types-helper';

import {
  AvatarUrlConfigOption,
  BodyConfigOption,
  ImageUrlConfigOption,
  SubTitleConfigOption,
  TextCardConfigs,
  TitleConfigOption,
  ZBodyConfigOption,
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
})
export class CarbonTextCardComponent
  extends BaseUIElementComponent
  implements UIElementImplementation<TextCardConfigs>
{
  static readonly ELEMENT_TYPE = 'CARBON_TEXT_CARD';
  override getElementType(): string {
    return CarbonTextCardComponent.ELEMENT_TYPE;
  }

  #defaultTitle = 'Default card title';
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

  #defaultBody = 'Default card body';
  bodyConfigOption: InputSignal<BodyConfigOption> = input(this.#defaultBody, {
    alias: 'body',
    transform: (val) =>
      parseZodWithDefault<BodyConfigOption>(ZBodyConfigOption, val, this.#defaultTitle),
  });
}
