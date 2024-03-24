import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateStoreService {
  #globalState: BehaviorSubject<Record<string, unknown>> = new BehaviorSubject({});
  #layoutState: BehaviorSubject<Record<string, unknown>> = new BehaviorSubject({});
  #localState: BehaviorSubject<Record<string, unknown>> = new BehaviorSubject({});
}
