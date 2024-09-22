import { NoEvent, UIElementTemplate } from '@namnguyen191/dui-core';
import { z } from 'zod';

export const ZTitleConfigOption = z.string({
  errorMap: () => ({ message: 'Title must be a string' }),
});
export type TitleConfigOption = z.infer<typeof ZTitleConfigOption>;

export const ZDescriptionConfigOption = z.string({
  errorMap: () => ({ message: 'Description must be a string' }),
});
export type DescriptionConfigOption = z.infer<typeof ZDescriptionConfigOption>;

export const ZCarouselImagesConfigOption = z.array(z.string(), {
  errorMap: () => ({ message: 'Carousel images must be an array of string' }),
});
export type CarouselImagesConfigOption = z.infer<typeof ZCarouselImagesConfigOption>;

export const ZCarouselCardConfigs = z.object({
  title: ZTitleConfigOption,
  description: ZDescriptionConfigOption,
  carouselImages: ZCarouselImagesConfigOption,
});
export type CarouselCardConfigs = z.infer<typeof ZCarouselCardConfigs>;

export type CarbonCarouselCardTypeForJsonSchema = UIElementTemplate<CarouselCardConfigs, NoEvent>;
