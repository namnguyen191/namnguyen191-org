import { Injectable } from '@angular/core';
import { asyncScheduler, Observable, observeOn, Subject } from 'rxjs';

import { UIElementPositionAndSize } from '../templates/layout-template-interfaces';

export type CoreEvent = {
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

export type CoreEventPayload<T extends keyof CoreEvent> = CoreEvent[T];

export type EventObject = {
  [K in keyof CoreEvent]: CoreEventPayload<K> extends never
    ? {
        type: K;
      }
    : {
        type: K;
        payload: CoreEventPayload<K>;
      };
}[keyof CoreEvent];

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
