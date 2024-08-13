import { z } from 'zod';

import { INTERPOLATION_REGEX } from '../interfaces';

export const ZodStringOrNumberOrBoolean = z.union([z.string(), z.number(), z.boolean()]);

export const ZodIsLoading = z.boolean({
  invalid_type_error: 'loading state must be a boolean',
});

export const ZodIsError = z.boolean({
  invalid_type_error: 'error state must be a boolean',
});

export const ZodObjectType = z.record(z.string(), z.any(), {
  invalid_type_error: 'must be an object with key-value',
});

export const ZodInterpolationString = z.string().regex(INTERPOLATION_REGEX);
