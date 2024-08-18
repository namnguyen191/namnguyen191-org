import { Injectable } from '@angular/core';
import { asyncScheduler, Observable, observeOn, Subject } from 'rxjs';

import { UIElementPositionAndSize } from '../templates/layout-template-interfaces';

export type DUIEvent = {
  GENERIC: never;
  MISSING_UI_ELEMENT: {
    type: string;
  };
  MISSING_LAYOUT_TEMPLATE: {
    id: string;
  };
  MISSING_UI_ELEMENT_TEMPLATE: {
    id: string;
  };
  MISSING_REMOTE_RESOURCE_TEMPLATE: {
    id: string;
  };
  UI_ELEMENT_REPOSITION: {
    layoutId: string;
    elementId: string;
    newPositionAndSize: UIElementPositionAndSize;
  };
};

export type DUIEventPayload<T extends keyof DUIEvent> = DUIEvent[T];

export type EventObject = {
  [K in keyof DUIEvent]: DUIEventPayload<K> extends never
    ? {
        type: K;
      }
    : {
        type: K;
        payload: DUIEventPayload<K>;
      };
}[keyof DUIEvent];

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  #events$: Subject<EventObject> = new Subject();

  getEvents(): Observable<EventObject> {
    return this.#events$.asObservable().pipe(observeOn(asyncScheduler));
  }

  emitEvent(event: EventObject): void {
    this.#events$.next(event);
  }
}
