import { useEffect, useState } from 'react';

export const useLocalStorage = <T>(key: string, initialState: T) => {
  const [value, setValue] = useState<T>(() => {
    const valueFromLocalStorage = localStorage.getItem(key);
    return valueFromLocalStorage ? JSON.parse(valueFromLocalStorage) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};
