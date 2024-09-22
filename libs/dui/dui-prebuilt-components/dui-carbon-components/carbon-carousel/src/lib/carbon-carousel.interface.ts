import { NoEvent, UIElementTemplate } from '@namnguyen191/dui-core';
import { z } from 'zod';

export const ZImageUrlsConfigOption = z.array(
  z.string({
    errorMap: () => ({ message: 'Image url must be a string' }),
  }),
  {
    errorMap: () => ({ message: 'Image urls must be a an array string' }),
  }
);
export type ImageUrlsConfigOption = z.infer<typeof ZImageUrlsConfigOption>;

export const ZAriaLabelConfigOption = z.string({
  errorMap: () => ({ message: 'Aria label must be a string' }),
});
export type AriaLabelConfigOption = z.infer<typeof ZAriaLabelConfigOption>;

export const ZCarouselConfigs = z.object({
  imageUrls: ZImageUrlsConfigOption,
  ariaLabel: ZAriaLabelConfigOption,
});
export type CarouselConfigs = z.infer<typeof ZCarouselConfigs>;

export type CarbonCarouselTypeForJsonSchema = UIElementTemplate<CarouselConfigs, NoEvent>;
