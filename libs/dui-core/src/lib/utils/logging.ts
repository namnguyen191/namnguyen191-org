export const logInfo = (msg: string): void => {
  console.info(`[INFO LOG] ${msg}`);
};

export const logError = (msg: string): void => {
  console.error(`[ERROR LOG] ${msg}`);
};

export const logWarning = (msg: string): void => {
  console.warn(`[WARNING LOG] ${msg}`);
};

export const logSubscription = (msg: string): void => {
  console.info(`[SUBSCRIPTION] ${msg}`);
};
