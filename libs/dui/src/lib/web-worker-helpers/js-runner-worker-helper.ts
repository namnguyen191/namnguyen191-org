import { ObjectType } from '@namnguyen191/types-helper';

import {
  FailedInterpolationResult,
  GetWorkerEvent,
  INTERPOLATION_ERROR_MESSAGE,
  WorkerResponse,
} from './worker-interfaces';

export type JSRunnerContext = ObjectType;

export const runRawJs = (
  rawJs: string,
  context: JSRunnerContext,
  allowList?: Set<string>
): unknown => {
  let contextOverride = '';
  if (allowList) {
    contextOverride = restrictCurrentExecutionContextGlobal(allowList);
  }
  const result = new Function(`${contextOverride}${rawJs}`).bind(context).call();
  return result;
};

export const handleRunJsMessage = (
  e: MessageEvent<GetWorkerEvent<'INTERPOLATE'>>,
  allowList?: Set<string>
): void => {
  const {
    data: {
      payload: { rawJs, context, id },
    },
  } = e;
  let result: unknown;

  try {
    result = runRawJs(rawJs, context, allowList);
  } catch (error) {
    console.warn(`Getting error: ${error}. \nFrom running: ${rawJs}.`);
    result = { error: INTERPOLATION_ERROR_MESSAGE } as FailedInterpolationResult;
  }

  const response: WorkerResponse = {
    result,
    id,
  };

  postMessage(response);
};

export const REQUIRED_ALLOW_LIST = new Set<string>(['undefined', 'null']);

export const restrictCurrentExecutionContextGlobal = (allowList: Set<string>): string => {
  const seenProperties: Set<string> = new Set<string>();

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  let currentContext: unknown = globalThis;
  do {
    const props = Object.getOwnPropertyNames(currentContext);
    props.forEach((prop) => {
      seenProperties.add(prop);
    });
    currentContext = Object.getPrototypeOf(currentContext);
  } while (currentContext);

  let contextOverride: string = '';
  const finalAllowList = new Set<string>([...allowList, ...REQUIRED_ALLOW_LIST]);
  seenProperties.forEach((prop) => {
    if (!finalAllowList.has(prop)) {
      // Object.defineProperty(context, prop, {
      //   get: () => {
      //     throw Error(`"${prop}" is forbidden`);
      //   },
      //   configurable: false,
      // });
      contextOverride += `const ${prop} = undefined;`;
    }
  });
  return contextOverride;
};
