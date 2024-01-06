import { useEffect } from 'react';

export const useKeyWatch = (key: globalThis.KeyboardEvent['key'], cb: () => void): void => {
  useEffect(() => {
    const listener = (e: globalThis.KeyboardEvent): void => {
      if (e.key.toLocaleLowerCase() === key.toLowerCase()) {
        cb();
      }
    };

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  });
};
