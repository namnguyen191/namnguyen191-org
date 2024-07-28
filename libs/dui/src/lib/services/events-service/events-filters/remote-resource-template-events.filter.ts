import { filter, Observable, pipe, UnaryFunction } from 'rxjs';

import { EventObject } from '../../../interfaces';

export const missingRemoteResourceTemplateEvent = (): UnaryFunction<
  Observable<EventObject>,
  Observable<Extract<EventObject, { type: 'MISSING_REMOTE_RESOURCE_TEMPLATE' }>>
> => {
  return pipe(filter((event) => event.type === 'MISSING_REMOTE_RESOURCE_TEMPLATE'));
};
