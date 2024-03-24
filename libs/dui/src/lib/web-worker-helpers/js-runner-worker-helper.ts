import { GetWorkerEvent, WorkerResponse } from './worker-interfaces';

export type JSRunnerContext = Record<string, unknown>;

export const runRawJs = (rawJs: string, context: JSRunnerContext): unknown => {
  return new Function(rawJs).bind(context).call();
};

export const handleRunJsMessage = (e: MessageEvent<GetWorkerEvent<'INTERPOLATE'>>): void => {
  const {
    data: {
      payload: { rawJs, context, id },
    },
  } = e;
  let result: unknown;

  try {
    result = runRawJs(rawJs, context);
  } catch (error) {
    console.warn(error);
    result = null;
  }

  const response: WorkerResponse = {
    result,
    id,
  };

  postMessage(response);
};
