import { inject, Injectable } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { get, isEqual, set } from 'lodash-es';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  pipe,
  UnaryFunction,
} from 'rxjs';
import { z } from 'zod';

export const ZodAvailableStateScope = z.enum(['global', 'local', 'layout']);
export type AvailableStateScope = z.infer<typeof ZodAvailableStateScope>;

export type StateMap = {
  [K in AvailableStateScope]: ObjectType;
};

export type StateSubscriptionConfig = {
  [K in AvailableStateScope]?: string[];
};

export const getStatesAsContext = (): Observable<StateMap> => {
  const stateStoreService = inject(StateStoreService);

  const local: Observable<ObjectType> = stateStoreService.getLocalState();

  const global: Observable<ObjectType> = stateStoreService.getGlobalState();

  const layout: Observable<ObjectType> = stateStoreService.getLayoutState();

  return combineLatest({
    global,
    local,
    layout,
  });
};

export const getStatesSubscriptionAsContext = (
  stateSubscription: StateSubscriptionConfig
): Observable<StateMap> => {
  const {
    local: localSubscription,
    layout: layoutSubscription,
    global: globalSubscription,
  } = stateSubscription;
  const stateStoreService = inject(StateStoreService);

  const local: Observable<ObjectType> = localSubscription
    ? stateStoreService.getLocalStateByPaths(localSubscription)
    : of({});

  const global: Observable<ObjectType> = globalSubscription
    ? stateStoreService.getGlobalStateByPaths(globalSubscription)
    : of({});

  const layout: Observable<ObjectType> = layoutSubscription
    ? stateStoreService.getLayoutStateByPaths(layoutSubscription)
    : of({});

  return combineLatest({
    global,
    local,
    layout,
  });
};

@Injectable({
  providedIn: 'root',
})
export class StateStoreService {
  #globalState: BehaviorSubject<ObjectType> = new BehaviorSubject({});
  #layoutState: BehaviorSubject<ObjectType> = new BehaviorSubject({});
  #localState: BehaviorSubject<ObjectType> = new BehaviorSubject({});

  getGlobalState(): Observable<ObjectType> {
    return this.#globalState.asObservable();
  }

  getGlobalStateByPaths(paths: string[]): Observable<ObjectType> {
    return this.#globalState.asObservable().pipe(this.watchStatePaths(paths));
  }

  getLocalState(): Observable<ObjectType> {
    return this.#localState.asObservable();
  }

  getLocalStateByPaths(paths: string[]): Observable<ObjectType> {
    return this.#localState.asObservable().pipe(this.watchStatePaths(paths));
  }

  getLayoutState(): Observable<ObjectType> {
    return this.#layoutState.asObservable();
  }

  getLayoutStateByPaths(paths: string[]): Observable<ObjectType> {
    return this.#layoutState.asObservable().pipe(this.watchStatePaths(paths));
  }

  addToState(params: { scope: AvailableStateScope; data: ObjectType }): void {
    const { scope, data } = params;

    switch (scope) {
      case 'global': {
        const oldGLobalState = this.#globalState.getValue();
        this.#globalState.next({
          ...oldGLobalState,
          ...data,
        });
        break;
      }
      case 'layout': {
        const oldLayoutState = this.#layoutState.getValue();
        this.#layoutState.next({
          ...oldLayoutState,
          ...data,
        });
        break;
      }
      case 'local': {
        const oldLocalState = this.#localState.getValue();
        this.#localState.next({
          ...oldLocalState,
          ...data,
        });
        break;
      }
      default:
        console.warn('Unknown state scope: ', scope);
    }
  }

  watchStatePaths(paths: string[]): UnaryFunction<Observable<ObjectType>, Observable<ObjectType>> {
    return pipe(
      map((state) => {
        const mappedState = {};
        for (const path of paths) {
          const statePiece = get(state, path);
          set(mappedState, path, statePiece);
        }

        return mappedState;
      }),
      distinctUntilChanged((prevState, curState) => isEqual(prevState, curState))
    );
  }
}
