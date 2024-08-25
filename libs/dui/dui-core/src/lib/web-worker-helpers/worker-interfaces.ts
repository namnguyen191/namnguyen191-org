import { InjectionToken } from '@angular/core';
import { Brand, ObjectType } from '@namnguyen191/types-helper';

export const JS_RUNNER_WORKER = new InjectionToken<Worker>('JS_RUNNER_WORKER');

export type BaseWorkerEventPayload = {
  id: string;
};

export type WorkerEventPayloadMap = {
  INTERPOLATE: {
    rawJs: string;
    context: ObjectType;
  };
  TEST: never;
};

export type WorkerEventPayload<T extends keyof WorkerEventPayloadMap> = BaseWorkerEventPayload &
  WorkerEventPayloadMap[T];

export type GetWorkerEvent<K extends keyof WorkerEventPayloadMap> =
  WorkerEventPayload<K> extends never
    ? {
        type: K;
      }
    : {
        type: K;
        payload: WorkerEventPayload<K>;
      };

export type WorkerEventObject = {
  [K in keyof WorkerEventPayloadMap]: GetWorkerEvent<K>;
}[keyof WorkerEventPayloadMap];

export const INTERPOLATION_ERROR_MESSAGE = 'Interpolation failed';

export type FailedInterpolationResult = {
  error: typeof INTERPOLATION_ERROR_MESSAGE;
};

export function isFailedInterpolationResult(result: unknown): result is FailedInterpolationResult {
  return !!(
    result &&
    typeof result === 'object' &&
    'error' in result &&
    result.error === INTERPOLATION_ERROR_MESSAGE
  );
}

export type WorkerResponse = {
  id: string;
  result: unknown | FailedInterpolationResult;
};

export type RawJsString = Brand<string, 'RawJsString'>;
