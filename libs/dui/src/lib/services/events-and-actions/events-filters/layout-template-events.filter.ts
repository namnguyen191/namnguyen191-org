import { filter, Observable, pipe, UnaryFunction } from 'rxjs';

import { EventObject } from '../events.service';

export const missingLayoutTemplateEvent = (): UnaryFunction<
  Observable<EventObject>,
  Observable<Extract<EventObject, { type: 'MISSING_LAYOUT_TEMPLATE' }>>
> => {
  return pipe(filter((event) => event.type === 'MISSING_LAYOUT_TEMPLATE'));
};
