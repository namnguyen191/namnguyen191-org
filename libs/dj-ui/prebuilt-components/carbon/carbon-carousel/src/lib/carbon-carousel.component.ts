import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
  signal,
  viewChildren,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  BackgroundImageDirective,
  CarbonCarouselElementType,
  CarbonCarouselSymbol,
  ModalComponent,
} from '@dj-ui/carbon-components/shared';
import { BaseUIElementComponent, logWarning, UIElementImplementation } from '@dj-ui/core';
import { parseZodWithDefault } from '@namnguyen191/types-helper';
import { IconModule } from 'carbon-components-angular';

import {
  AriaLabelConfigOption,
  CarouselConfigs,
  ImageUrlsConfigOption,
  ZAriaLabelConfigOption,
  ZImageUrlsConfigOption,
} from './carbon-carousel.interface';

type CarouselImage = {
  imageUrl: string;
  imageId: string;
};

@Component({
  selector: 'dj-ui-carbon-carousel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconModule,
    BackgroundImageDirective,
    ModalComponent,
    NgOptimizedImage,
  ],
  templateUrl: './carbon-carousel.component.html',
  styleUrl: './carbon-carousel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.aria-label]': 'ariaLabelConfigOption()',
  },
})
export class CarbonCarouselComponent
  extends BaseUIElementComponent
  implements UIElementImplementation<CarouselConfigs>
{
  static override readonly ELEMENT_TYPE = CarbonCarouselElementType;
  static override readonly ELEMENT_SYMBOL = CarbonCarouselSymbol;

  override getElementType(): string {
    return CarbonCarouselComponent.ELEMENT_TYPE;
  }

  override getSymbol(): symbol {
    return CarbonCarouselComponent.ELEMENT_SYMBOL;
  }

  imageUrlsConfigOption: InputSignalWithTransform<CarouselImage[], string[]> = input([], {
    alias: 'imageUrls',
    transform: (val) => {
      const ulrs = parseZodWithDefault<ImageUrlsConfigOption>(ZImageUrlsConfigOption, val, []);
      return ulrs.map((url, idx) => ({
        imageUrl: url,
        imageId: `carousel-slide-${idx}`,
      }));
    },
  });

  #defaultAriaLabel = 'images gallery';
  ariaLabelConfigOption: InputSignal<AriaLabelConfigOption> = input(this.#defaultAriaLabel, {
    alias: 'ariaLabel',
    transform: (val) =>
      parseZodWithDefault<AriaLabelConfigOption>(
        ZAriaLabelConfigOption,
        val,
        this.#defaultAriaLabel
      ),
  });

  private readonly _carouselSlides: Signal<readonly ElementRef<HTMLLIElement>[]> = viewChildren(
    'carouselSlide',
    {
      read: ElementRef,
    }
  );

  readonly currentPreviewImageSig = signal<string | null>(null);

  setImageToPreview(imageUrl: string): void {
    this.currentPreviewImageSig.set(imageUrl);
  }

  changeToSlide(id: string): void {
    const slideElement = this._carouselSlides().find(
      (ele) => ele.nativeElement.id === id
    )?.nativeElement;
    if (!slideElement) {
      logWarning(`Slide with id ${id} does not exist. This shouldn't have happened.`);
      return;
    }

    slideElement.scrollIntoView();
  }
}
