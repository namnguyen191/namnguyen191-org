import { inject, Injectable } from '@angular/core';

import { JS_RUNNER_WORKER, WorkerEventObject } from '../web-worker-helpers';

@Injectable({
  providedIn: 'root',
})
export class InterpolationService {
  #jsRunnerWorker: Worker = inject(JS_RUNNER_WORKER);

  constructor() {
    this.#jsRunnerWorker.onmessage = (e): void => {
      console.log('Nam data is: ', e.data);
    };
    this.interpolate('run this js codes');
  }

  interpolate(rawJS: string): void {
    const interpolateEvent: WorkerEventObject = {
      type: 'INTERPOLATE',
      payload: {
        rawJS,
      },
    };
    this.#jsRunnerWorker.postMessage(interpolateEvent);
  }
}
