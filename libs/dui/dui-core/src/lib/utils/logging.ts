export const logInfo = (msg: string): void => {
  console.info(`[DUI INFO LOG] ${msg}`);
};

export const logError = (msg: string): void => {
  console.error(`[DUI ERROR LOG] ${msg}`);
};

export const logWarning = (msg: string): void => {
  console.warn(`[DUI WARNING LOG] ${msg}`);
};

export const logSubscription = (msg: string): void => {
  console.info(`[DUI SUBSCRIPTION LOG] ${msg}`);
};
