import { ZodContextBasedActionHooks, ZodStringOrNumberOrBoolean } from '@namnguyen191/dui';
import { z } from 'zod';

export const ZodTableRowObject = z.array(ZodStringOrNumberOrBoolean);
export type TableRowObject = z.infer<typeof ZodTableRowObject>;

export const ZodTableRowsConfig = z.array(ZodTableRowObject);
export type TableRowsConfig = z.infer<typeof ZodTableRowsConfig>;

export const ZodTableHeadersConfig = z.array(ZodStringOrNumberOrBoolean);
export type TableHeadersConfig = z.infer<typeof ZodTableHeadersConfig>;

export const ZodTableDescriptionConfig = z.string({
  errorMap: () => ({ message: 'Table description must be a string' }),
});
export type TableDescriptionConfig = z.infer<typeof ZodTableDescriptionConfig>;

export const ZodTablePaginationConfigs = z.object({
  pageSizes: z.array(z.number()).optional(),
  onPageChange: ZodContextBasedActionHooks.optional(),
  pageInputDisabled: z.boolean().optional(),
  totalDataLength: z.number().optional(),
});
export type TablePaginationConfigs = z.infer<typeof ZodTablePaginationConfigs>;

export const ZodCarbonTableUIElementComponentConfigs = z.object({
  title: z.string(),
  headers: ZodTableHeadersConfig,
  rows: ZodTableRowsConfig,
  description: ZodTableDescriptionConfig,
  pagination: ZodTablePaginationConfigs,
});

export type CarbonTableUIElementComponentConfigs = z.infer<
  typeof ZodCarbonTableUIElementComponentConfigs
>;
