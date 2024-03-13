import { GetWorkerEvent } from './worker-interfaces';

export type JSRunnerContext = Record<string, unknown>;

export const runRawJs = (rawJS: string, context: JSRunnerContext): unknown => {
  return new Function(rawJS).bind(context).call();
};

export const handleRunJsMessage = (e: MessageEvent<GetWorkerEvent<'INTERPOLATE'>>): void => {
  const {
    data: {
      payload: { rawJS, context },
    },
  } = e;
  let result: unknown;
  try {
    result = runRawJs(rawJS, context);
  } catch (error) {
    console.warn(error);
    result = null;
  }
  postMessage(result);
};
