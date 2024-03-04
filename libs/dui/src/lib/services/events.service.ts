import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export enum Event {
  MISSING_UI_ELEMENT = 'Missing UI element',
}

export type EventPayload<T extends Event> = T extends Event.MISSING_UI_ELEMENT
  ? { type: string }
  : never;

export const constructEvent = <TEvent extends Event>(params: {
  event: TEvent;
  payload: EventPayload<TEvent>;
}): {
  event: TEvent;
  payload: EventPayload<TEvent>;
} => params;

export type EventObject = ReturnType<typeof constructEvent>;

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  #events$: Subject<EventObject> = new Subject();

  getEvents(): Observable<EventObject> {
    return this.#events$.asObservable();
  }

  emitEvent(event: EventObject): void {
    this.#events$.next(event);
  }
}
