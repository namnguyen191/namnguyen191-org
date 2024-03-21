import { inject, Injectable } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { BehaviorSubject, filter, firstValueFrom, map } from 'rxjs';

import { INTERPOLATION_REGEX, RawJsString } from '../interfaces';
import {
  JS_RUNNER_WORKER,
  JSRunnerContext,
  WorkerEventObject,
  WorkerResponse,
} from '../web-worker-helpers';

@Injectable({
  providedIn: 'root',
})
export class InterpolationService {
  #jsRunnerWorker: Worker;
  #workerMessagesSubject = new BehaviorSubject<WorkerResponse | null>(null);

  constructor() {
    try {
      this.#jsRunnerWorker = inject(JS_RUNNER_WORKER);
    } catch (error) {
      throw new Error(
        'You will need to provide a worker through the JS_RUNNER_WORKER token. Please refer to the docs on how to do this'
      );
    }

    this.#jsRunnerWorker.onmessage = (e: MessageEvent<WorkerResponse>): void => {
      this.#workerMessagesSubject.next(e.data);
    };
  }

  interpolate(params: { rawJS: RawJsString; context: JSRunnerContext }): Promise<unknown> {
    const id = Math.random().toString();
    const { rawJS, context } = params;
    const interpolateEvent: WorkerEventObject = {
      type: 'INTERPOLATE',
      payload: {
        id,
        rawJS,
        context,
      },
    };
    this.#jsRunnerWorker.postMessage(interpolateEvent);

    return firstValueFrom(
      this.#workerMessagesSubject.pipe(
        filter((msg): msg is WorkerResponse => msg?.id === id),
        map((msg) => msg.result)
      )
    );
  }

  extractRawJs(input: string): RawJsString | null {
    if (INTERPOLATION_REGEX.test(input)) {
      return INTERPOLATION_REGEX.exec(input)?.[2] as RawJsString;
    }
    return null;
  }

  async interpolateObject<T extends ObjectType>(params: {
    state: Record<string, unknown>;
    object: T;
  }): Promise<T> {
    const { state, object } = params;
    const clonedObject = structuredClone(object);
    for (const [key, val] of Object.entries(clonedObject)) {
      if (!val) {
        continue;
      }

      if (typeof val === 'object') {
        clonedObject[key as keyof T] = (await this.interpolateObject({
          object: val as ObjectType,
          state,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        })) as any;
      } else if (typeof val === 'string') {
        const rawJs = this.extractRawJs(val);
        if (rawJs) {
          clonedObject[key as keyof T] = (await this.interpolate({
            rawJS: rawJs as RawJsString,
            context: state,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          })) as any;
        }
      }
    }

    return clonedObject;
  }
}
