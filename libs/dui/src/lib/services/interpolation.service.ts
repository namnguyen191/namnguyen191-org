import { inject, Injectable } from '@angular/core';

import { JS_RUNNER_WORKER, JSRunnerContext, WorkerEventObject } from '../web-worker-helpers';

@Injectable({
  providedIn: 'root',
})
export class InterpolationService {
  #jsRunnerWorker: Worker = inject(JS_RUNNER_WORKER);

  constructor() {
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
