import { NoEvent, UIElementTemplate } from '@dj-ui/core';
import { z } from 'zod';

export const ZTitleConfigOption = z.string({
  errorMap: () => ({ message: 'Title must be a string' }),
});
export type TitleConfigOption = z.infer<typeof ZTitleConfigOption>;

export const ZDescriptionConfigOption = z.string({
  errorMap: () => ({ message: 'Description must be a string' }),
});
export type DescriptionConfigOption = z.infer<typeof ZDescriptionConfigOption>;

export const ZCarouselIdConfigOption = z.string({
  errorMap: () => ({
    message: 'CarouselId must be a string',
  }),
});
export type CarouselIdConfigOption = z.infer<typeof ZCarouselIdConfigOption>;

export const ZCarouselCardConfigs = z.object({
  title: ZTitleConfigOption,
  description: ZDescriptionConfigOption,
  carouselId: ZCarouselIdConfigOption,
});
export type CarouselCardConfigs = z.infer<typeof ZCarouselCardConfigs>;

export type CarbonCarouselCardTypeForJsonSchema = UIElementTemplate<CarouselCardConfigs, NoEvent>;
