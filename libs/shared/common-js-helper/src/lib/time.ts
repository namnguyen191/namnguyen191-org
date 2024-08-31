export const delay = (millisec: number, fn?: () => void): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (fn) {
        fn();
      }
      resolve();
    }, millisec);
  });
};
