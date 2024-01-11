export const debounced = <TArgs extends unknown[]>(
  cb: (...args: TArgs) => void,
  delay = 500
): ((...args: TArgs) => void) => {
  let cbTimer: number | null = null;

  return (...args: TArgs) => {
    if (cbTimer) {
      clearTimeout(cbTimer);
    }
    cbTimer = window.setTimeout(() => {
      cb(...args);
    }, delay);
  };
};
