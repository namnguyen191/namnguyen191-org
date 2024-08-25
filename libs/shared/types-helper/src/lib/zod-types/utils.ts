import { ZodError, ZodType } from 'zod';

export const parseZodWithDefault = <T>(zodType: ZodType, val: unknown, defaultVal: T): T => {
  try {
    const result = zodType.parse(val) as T;

    return result;
  } catch (error) {
    if (error instanceof ZodError) {
      console.warn(
        `Receiving: ${JSON.stringify(val)} which is an invalid option: ${error.message}. The default value: ${JSON.stringify(defaultVal)} will be used instead.`
      );
    } else {
      console.warn(
        `An unknown error has occured while trying to interpolate ${JSON.stringify(val)}. The default value: ${JSON.stringify(defaultVal)} will be used instead.`
      );
    }

    return defaultVal;
  }
};
