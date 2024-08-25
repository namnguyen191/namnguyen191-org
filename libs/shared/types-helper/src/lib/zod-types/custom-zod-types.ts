import { z } from 'zod';

export const ZodNonEmptyPrimitive = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.bigint(),
  z.symbol(),
]);

export const ZodObjectType = z.record(z.string(), z.any(), {
  invalid_type_error: 'must be an object with key-value',
});
