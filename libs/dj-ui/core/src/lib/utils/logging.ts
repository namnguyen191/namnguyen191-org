export const logInfo = (msg: string): void => {
  console.info(`[DJ-UI INFO LOG] ${msg}`);
};

export const logError = (msg: string): void => {
  console.error(`[DJ-UI ERROR LOG] ${msg}`);
};

export const logWarning = (msg: string): void => {
  console.warn(`[DJ-UI WARNING LOG] ${msg}`);
};

export const logSubscription = (msg: string): void => {
  console.info(`[DJ-UI SUBSCRIPTION LOG] ${msg}`);
};
