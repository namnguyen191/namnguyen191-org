import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { State } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class StateStoreService {
  #globalState: BehaviorSubject<State> = new BehaviorSubject({});
  #layoutState: BehaviorSubject<State> = new BehaviorSubject({});
  #localState: BehaviorSubject<State> = new BehaviorSubject({});

  getGlobalState(): Observable<State> {
    return this.#globalState.asObservable();
  }

  getLocalState(): Observable<State> {
    return this.#localState.asObservable();
  }

  getLayoutState(): Observable<State> {
    return this.#layoutState.asObservable();
  }
}
