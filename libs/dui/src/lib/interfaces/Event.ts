import { UIElementPositionAndSize } from './Layout';

export type DUIEvent = {
  GENERIC: never;
  MISSING_UI_ELEMENT: {
    type: string;
  };
  MISSING_LAYOUT: {
    id: string;
  };
  MISSING_UI_ELEMENT_TEMPLATE: {
    id: string;
  };
  MISSING_REMOTE_RESOURCE: {
    id: string;
  };
  UI_ELEMENT_REPOSITION: {
    id: string;
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
