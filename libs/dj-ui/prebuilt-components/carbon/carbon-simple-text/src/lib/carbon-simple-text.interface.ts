import { NoEvent, UIElementTemplate } from '@dj-ui/core';
import { z } from 'zod';

export const ZTextConfigOption = z.string({
  errorMap: () => ({ message: 'Text must be a string' }),
});
export type TextConfigOption = z.infer<typeof ZTextConfigOption>;

export const ZSimpleTextConfigs = z.object({
  text: ZTextConfigOption,
});
export type SimpleTextConfigs = z.infer<typeof ZSimpleTextConfigs>;

export type CarbonSimpleTextTypeForJsonSchema = UIElementTemplate<SimpleTextConfigs, NoEvent>;
