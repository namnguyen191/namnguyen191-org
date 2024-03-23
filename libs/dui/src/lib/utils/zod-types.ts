import { z } from 'zod';

export const zodStringOrNumberOrBoolean = z.union([z.string(), z.number(), z.boolean()]);
export const zodIsLoading = z.boolean({
  invalid_type_error: 'loading state must be a boolean',
});
