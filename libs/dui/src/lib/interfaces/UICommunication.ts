export type DispatchableAction = {
  UPDATE_CONFIG_OPTIONS: never;
};

export type SubscribableEvents = {
  WATCH_STATE: {
    scope: string;
    path: string;
    actionsToDispatch: DispatchableAction[];
  };
};
