import { MutableRefObject, useEffect, useRef } from 'react';

export const useOutsideClick = <T extends HTMLElement>(
  onOutsideClick: () => void
): MutableRefObject<T | null> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const handleOnOutsideClick = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick();
      }
    };

    document.addEventListener('click', handleOnOutsideClick, true);

    return (): void => document.removeEventListener('click', handleOnOutsideClick, true);
  }, [onOutsideClick]);

  return ref;
};
