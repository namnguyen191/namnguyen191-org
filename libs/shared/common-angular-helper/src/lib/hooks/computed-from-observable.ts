import { effect, Signal, signal } from '@angular/core';
import { Observable } from 'rxjs';

export const computedFromObservable = <T>(getObs: () => Observable<T>): Signal<T | undefined> => {
  const sigToReturn = signal<T | undefined>(undefined);

  effect(
    (onCleanup) => {
      const obs = getObs();

      const sub = obs.subscribe((val) => sigToReturn.set(val));

      onCleanup(() => {
        sub.unsubscribe();
      });
    },
    { allowSignalWrites: true }
  );

  return sigToReturn;
};
