import { inject, Injectable } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { isEmpty } from 'lodash-es';
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

  interpolateRawJs(params: { rawJs: RawJsString; context: JSRunnerContext }): Promise<unknown> {
    const id = Math.random().toString();
    const { rawJs, context } = params;
    const interpolateEvent: WorkerEventObject = {
      type: 'INTERPOLATE',
      payload: {
        id,
        rawJs,
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

  async interpolateString(params: {
    stringContent: string;
    context: ObjectType;
  }): Promise<unknown> {
    const { context, stringContent } = params;
    const trimmedStringContent = stringContent.trim();
    const rawJs = this.extractRawJs(trimmedStringContent);

    if (rawJs) {
      return await this.interpolateRawJs({
        rawJs: rawJs as RawJsString,
        context: context,
      });
    }

    return stringContent;
  }

  async interpolateObject<T extends ObjectType>(params: {
    context: ObjectType;
    object: T;
  }): Promise<T> {
    const { context, object } = params;
    const clonedObject = structuredClone(object);
    for (const [key, val] of Object.entries(clonedObject)) {
      clonedObject[key as keyof T] = (await this.interpolate({
        value: val,
        context: context,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any;
    }

    return clonedObject;
  }

  async interpolateArray<T extends unknown[]>(params: {
    context: ObjectType;
    array: T;
  }): Promise<T> {
    const { context, array } = params;
    const clonedArray = structuredClone(array);
    for (let i = 0; i < clonedArray.length; i++) {
      const val = clonedArray[i];
      clonedArray[i] = (await this.interpolate({
        value: val,
        context: context,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any;
    }

    return clonedArray;
  }

  async interpolate(params: { value: unknown; context: ObjectType }): Promise<unknown> {
    const { value, context } = params;

    if (!value || isEmpty(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return this.interpolateString({
        stringContent: value,
        context,
      });
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return this.interpolateArray({
          array: value,
          context,
        });
      }

      return this.interpolateObject({
        object: value as ObjectType,
        context,
      });
    }

    return value;
  }
}
