import { useEffect, useState } from 'react';

export const usePrefferedDarkTheme = (): { isDarkTheme: boolean } => {
  const isCurrentDarkTheme = (): boolean =>
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDarkTheme, setIsDarkTheme] = useState(isCurrentDarkTheme());

  useEffect(() => {
    const themeChangeListener = (e: MediaQueryListEvent): void => {
      console.log('Nam data is: ', e);
      setIsDarkTheme(e.matches);
    };
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    darkThemeMq.addEventListener('change', themeChangeListener);
    return (): void => darkThemeMq.removeEventListener('change', themeChangeListener);
  }, []);

  return { isDarkTheme };
};
