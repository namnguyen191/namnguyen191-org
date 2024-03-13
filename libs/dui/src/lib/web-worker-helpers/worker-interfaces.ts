import { InjectionToken } from '@angular/core';

export const JS_RUNNER_WORKER = new InjectionToken<Worker>('JS_RUNNER_WORKER');

export type WorkerEvent = {
  INTERPOLATE: {
    rawJS: string;
    context: Record<string, unknown>;
  };
  TEST: never;
};

export type WorkerEventPayload<T extends keyof WorkerEvent> = WorkerEvent[T];

export type GetWorkerEvent<K extends keyof WorkerEvent> =
  WorkerEventPayload<K> extends never
    ? {
        type: K;
      }
    : {
        type: K;
        payload: WorkerEventPayload<K>;
      };

export type WorkerEventObject = {
  [K in keyof WorkerEvent]: GetWorkerEvent<K>;
}[keyof WorkerEvent];
