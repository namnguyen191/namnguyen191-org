import { inject } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { combineLatest, map, Observable, of, shareReplay } from 'rxjs';

import { StateSubscriptionConfig } from '../../interfaces';
import { RemoteResourceService, RemoteResourceState } from '../remote-resource.service';
import { AvailableStateScope, StateStoreService } from '../state-store.service';

export type StateMap = {
  [K in AvailableStateScope]: ObjectType;
};

export type ElementInputsInterpolationContext = {
  remoteResourcesStates: null | RemoteResourcesStates;
  state: StateMap;
};

type AccumulatedRequestsResults = unknown[];

export type RequestConfigsInterpolationContext = {
  state: StateMap;
  $requests?: AccumulatedRequestsResults;
};

export type RequestTransformationInterpolationContext = RequestConfigsInterpolationContext & {
  $current: unknown;
};

export type RequestHooksInterpolationContext = {
  state: StateMap;
  $result: unknown;
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

export type RemoteResourcesStates = {
  results: {
    [remoteResourceId: string]: RemoteResourceState;
  };
  isAllLoading: boolean;
  isPartialLoading: string[];
  isAllError: boolean;
  isPartialError: string[];
};
const getRemoteResourcesStatesAsContext = (
  remoteResourceIds: string[]
): Observable<RemoteResourcesStates> => {
  const remoteResourceService = inject(RemoteResourceService);

  const remoteResourcesStatesMap: { [id: string]: Observable<RemoteResourceState> } =
    remoteResourceIds.reduce(
      (acc, curId) => ({ ...acc, [curId]: remoteResourceService.getRemoteResourceState(curId) }),
      {}
    );

  return combineLatest(remoteResourcesStatesMap).pipe(
    map((statesMap) => {
      const isAllLoading = Object.entries(statesMap).every(([, state]) => state.isLoading);
      const isPartialLoading: string[] = Object.entries(statesMap).reduce(
        (acc, [curId, curState]) => {
          if (curState.isLoading) {
            return [...acc, curId];
          }

          return acc;
        },
        [] as string[]
      );
      const isAllError = Object.entries(statesMap).every(([, state]) => state.isLoading);
      const isPartialError: string[] = Object.entries(statesMap).reduce(
        (acc, [curId, curState]) => {
          if (curState.isError) {
            return [...acc, curId];
          }

          return acc;
        },
        [] as string[]
      );

      return {
        results: statesMap,
        isAllLoading,
        isPartialLoading,
        isAllError,
        isPartialError,
      };
    })
  );
};

export const getElementInputsInterpolationContext = (params: {
  remoteResourceIds?: string[];
  stateSubscription?: StateSubscriptionConfig;
}): Observable<ElementInputsInterpolationContext> => {
  const { remoteResourceIds, stateSubscription = {} } = params;

  const state = getStatesSubscriptionAsContext(stateSubscription);
  const remoteResourcesStates = remoteResourceIds?.length
    ? getRemoteResourcesStatesAsContext(remoteResourceIds)
    : of(null);

  return combineLatest({
    remoteResourcesStates,
    state,
  }).pipe(shareReplay(1));
};

export const getResourceRequestConfigInterpolationContext = (
  accumulatedRequestsResults: AccumulatedRequestsResults
): Observable<RequestConfigsInterpolationContext> => {
  const state = getStatesAsContext();
  const $requests = of(accumulatedRequestsResults);

  return combineLatest({
    $requests,
    state,
  }).pipe(shareReplay(1));
};

export const getResourceRequestTransformationInterpolationContext = (params: {
  accumulatedRequestsResults?: AccumulatedRequestsResults;
  currentRequestResult?: unknown;
}): Observable<RequestTransformationInterpolationContext> => {
  const { accumulatedRequestsResults, currentRequestResult } = params;
  const state = getStatesAsContext();
  const $requests = of(accumulatedRequestsResults);
  const $current = of(currentRequestResult);

  return combineLatest({
    $requests,
    state,
    $current,
  }).pipe(shareReplay(1));
};

export const getResourceRequestHooksInterpolationContext = (
  transformationResult: unknown
): Observable<RequestHooksInterpolationContext> => {
  const state = getStatesAsContext();
  const $result = of(transformationResult);

  return combineLatest({
    $result,
    state,
  }).pipe(shareReplay(1));
};
