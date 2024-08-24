import { z } from 'zod';

export const ZodButtonTypeConfig = z.enum([
  'primary',
  'secondary',
  'tertiary',
  'ghost',
  'danger',
  'danger--primary',
  'danger--tertiary',
  'danger--ghost',
]);

export type ButtonTypeConfig = z.infer<typeof ZodButtonTypeConfig>;

export const ZodCarbonButtonUIElementComponentConfigs = z.object({
  text: z.string(),
  type: ZodButtonTypeConfig,
});

export type CarbonButtonUIElementComponentConfigs = z.infer<
  typeof ZodCarbonButtonUIElementComponentConfigs
>;

export type CarbonButtonUIElementComponentEvents = {
  buttonClicked: void;
};
