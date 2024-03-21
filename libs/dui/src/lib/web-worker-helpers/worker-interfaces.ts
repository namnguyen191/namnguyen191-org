import { InjectionToken } from '@angular/core';

export const JS_RUNNER_WORKER = new InjectionToken<Worker>('JS_RUNNER_WORKER');

export type BaseWorkerEventPayload = {
  id: string;
};

export type WorkerEventPayloadMap = {
  INTERPOLATE: {
    rawJS: string;
    context: Record<string, unknown>;
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

export type WorkerResponse = {
  id: string;
  result: unknown;
};
