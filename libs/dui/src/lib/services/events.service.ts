import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { EventObject } from '../interfaces/Event';

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
