import { isObservable, map, Observable, of, OperatorFunction } from 'rxjs';
import { ZodError, ZodType } from 'zod';

import { logError } from './logging';

export const parseZodAndHandleErrorPipe = <T>(zodType: ZodType): OperatorFunction<T, T> => {
  return map((val) => {
    try {
      return zodType.parse(val);
    } catch (error) {
      if (error instanceof ZodError) {
        for (const zodIssue of error.errors) {
          if (zodIssue.code === 'invalid_type') {
            logError(`${zodIssue.message}. Received: ${JSON.stringify(val)}`);
          }
        }
      }
      throw error;
    }
  });
};

export const inputObsTransform = (
  zodType: ZodType
): (<T>(val: T | Observable<T>) => Observable<T>) => {
  return <T>(val: T | Observable<T>): Observable<T> => {
    if (!isObservable(val)) {
      return of(val).pipe(parseZodAndHandleErrorPipe(zodType));
    }
    return val.pipe(parseZodAndHandleErrorPipe(zodType));
  };
};
