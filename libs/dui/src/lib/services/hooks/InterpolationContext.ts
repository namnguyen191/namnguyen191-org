import { inject } from '@angular/core';
import { ObjectType } from '@namnguyen191/types-helper';
import { combineLatest, Observable, of, shareReplay } from 'rxjs';

import { StateSubscriptionConfig } from '../../interfaces';
import { RemoteResourceService, RemoteResourceState } from '../remote-resource.service';
import { AvailableStateScope, StateStoreService } from '../state-store.service';

export type StateMap = {
  [K in AvailableStateScope]: ObjectType;
};

export type ElementInputsInterpolationContext = {
  remoteResourceState: null | RemoteResourceState;
  state: StateMap;
};

type AccumulatedRequestsResults = unknown[];

export type RequestConfigsInterpolationContext = {
  state: StateMap;
  $requests: AccumulatedRequestsResults;
};

export type RequestTransformationInterpolationContext = RequestConfigsInterpolationContext & {
  $current: unknown;
};

export type RequestHooksInterpolationContext = {
  state: StateMap;
  $result: unknown;
};

const getStatesAsContext = (): Observable<StateMap> => {
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

const getRemoteResourceStateAsContext = (
  remoteResourceId: string
): Observable<RemoteResourceState> => {
  const remoteResourceService = inject(RemoteResourceService);

  return remoteResourceService.getRemoteResourceState(remoteResourceId);
};

export const getElementInputsInterpolationContext = (params: {
  remoteResourceId?: string;
  stateSubscription?: StateSubscriptionConfig;
}): Observable<ElementInputsInterpolationContext> => {
  const { remoteResourceId, stateSubscription = {} } = params;

  const state = getStatesSubscriptionAsContext(stateSubscription);
  const remoteResourceState = remoteResourceId
    ? getRemoteResourceStateAsContext(remoteResourceId)
    : of(null);

  return combineLatest({
    remoteResourceState,
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
  accumulatedRequestsResults: AccumulatedRequestsResults;
  currentRequestResult: unknown;
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
