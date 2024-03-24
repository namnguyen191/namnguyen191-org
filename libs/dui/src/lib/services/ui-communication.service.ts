import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SubscribableEvents } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UICommunicationService {
  #subscribers$: BehaviorSubject<{ [uiElementInstanceId: string]: SubscribableEvents[] }> =
    new BehaviorSubject({});
}
