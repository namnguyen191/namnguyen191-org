import { filter, Observable, pipe, UnaryFunction } from 'rxjs';

import { EventObject } from './events.service';

export const missingLayoutTemplateEvent = (): UnaryFunction<
  Observable<EventObject>,
  Observable<Extract<EventObject, { type: 'MISSING_LAYOUT_TEMPLATE' }>>
> => {
  return pipe(filter((event) => event.type === 'MISSING_LAYOUT_TEMPLATE'));
};

export const missingRemoteResourceTemplateEvent = (): UnaryFunction<
  Observable<EventObject>,
  Observable<Extract<EventObject, { type: 'MISSING_REMOTE_RESOURCE_TEMPLATE' }>>
> => {
  return pipe(filter((event) => event.type === 'MISSING_REMOTE_RESOURCE_TEMPLATE'));
};

export const missingUIElementTemplateEvent = (): UnaryFunction<
  Observable<EventObject>,
  Observable<Extract<EventObject, { type: 'MISSING_UI_ELEMENT_TEMPLATE' }>>
> => {
  return pipe(filter((event) => event.type === 'MISSING_UI_ELEMENT_TEMPLATE'));
};

export const UIElementRepositionEvent = (): UnaryFunction<
  Observable<EventObject>,
  Observable<Extract<EventObject, { type: 'UI_ELEMENT_REPOSITION' }>>
> => {
  return pipe(filter((event) => event.type === 'UI_ELEMENT_REPOSITION'));
};
