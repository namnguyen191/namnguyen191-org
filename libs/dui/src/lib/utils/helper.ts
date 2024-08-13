import { inject } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { isObservable, map, Observable, of, OperatorFunction } from 'rxjs';
import { ZodError, ZodType } from 'zod';

import { ActionHook, ContextBasedActionHooks } from '../interfaces';
import { ActionHookService, InterpolationService } from '../services';
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

export type InterpolateAndTriggerContextBasedActionHooksParams = {
  context: ObjectType;
  hooks: ContextBasedActionHooks;
};
export const interpolateAndTriggerContextBasedActionHooks = async (
  params: InterpolateAndTriggerContextBasedActionHooksParams
): Promise<void> => {
  const { hooks, context } = params;
  if (hooks.length === 0) {
    return;
  }

  // Always interpolate cause the ActionHook might have partial interpolation
  const interpolationService = inject(InterpolationService);
  const actionHookService = inject(ActionHookService);

  try {
    const interpolatedHooks = (await interpolationService.interpolate({
      context,
      value: hooks,
    })) as ActionHook[];

    actionHookService.triggerActionHooks(interpolatedHooks);
  } catch (error) {
    console.warn(`Failed to interpolate action hooks: ${JSON.stringify(hooks)}`);
  }
};
