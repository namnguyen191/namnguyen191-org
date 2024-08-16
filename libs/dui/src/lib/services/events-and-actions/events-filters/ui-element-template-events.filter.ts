import { filter, Observable, pipe, UnaryFunction } from 'rxjs';

import { EventObject } from '../events.service';

export const missingUIElementTemplateEvent = (): UnaryFunction<
  Observable<EventObject>,
  Observable<Extract<EventObject, { type: 'MISSING_UI_ELEMENT_TEMPLATE' }>>
> => {
  return pipe(filter((event) => event.type === 'MISSING_UI_ELEMENT_TEMPLATE'));
};
