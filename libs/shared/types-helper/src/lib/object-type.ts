import { z } from 'zod';

import { ZodObjectType } from './zod-types/custom-zod-types';

export type ObjectType = z.infer<typeof ZodObjectType>;

export type EmptyObject = Record<string, never>;
