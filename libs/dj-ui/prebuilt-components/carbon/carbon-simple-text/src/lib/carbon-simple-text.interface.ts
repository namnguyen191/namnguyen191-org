import { NoEvent, UIElementTemplate } from '@dj-ui/core';
import { z } from 'zod';

export const ZTextBlockConfigOption = z.strictObject({
  text: z.string(),
  type: z.enum(['title', 'paragraph']).optional().default('paragraph'),
});
export type TextBlockConfigOption = z.input<typeof ZTextBlockConfigOption>;

export const ZTextBlocksConfigOption = z.array(ZTextBlockConfigOption);
export type TextBlocksConfigOption = z.input<typeof ZTextBlocksConfigOption>;

export const ZSimpleTextConfigs = z.strictObject({
  textBlocks: ZTextBlocksConfigOption,
});
export type SimpleTextConfigs = z.input<typeof ZSimpleTextConfigs>;

export type CarbonSimpleTextTypeForJsonSchema = UIElementTemplate<SimpleTextConfigs, NoEvent>;
