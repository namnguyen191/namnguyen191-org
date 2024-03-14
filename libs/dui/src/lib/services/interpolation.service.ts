import { inject, Injectable } from '@angular/core';

import { JS_RUNNER_WORKER, JSRunnerContext, WorkerEventObject } from '../web-worker-helpers';

@Injectable({
  providedIn: 'root',
})
export class InterpolationService {
  #jsRunnerWorker: Worker;

  constructor() {
    try {
      this.#jsRunnerWorker = inject(JS_RUNNER_WORKER);
    } catch (error) {
      throw new Error(
        'You will need to provide a worker through the JS_RUNNER_WORKER token. Please refer to the docs on how to do this'
      );
    }

    this.#jsRunnerWorker.onmessage = (e): void => {
      console.log('Nam data is: ', e.data);
    };
    this.interpolate({
      rawJS: `return Math.random()`,
      context: { name: 'Vu Hoang Nam' },
    });
  }

  interpolate(params: { rawJS: string; context: JSRunnerContext }): void {
    const { rawJS, context } = params;
    const interpolateEvent: WorkerEventObject = {
      type: 'INTERPOLATE',
      payload: {
        rawJS,
        context,
      },
    };
    this.#jsRunnerWorker.postMessage(interpolateEvent);
  }
}
