import {
  createContext,
  PropsWithChildren,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useLocalStorage } from '../hooks/useLocalStorageState';
import { usePrefferedDarkTheme } from '../hooks/usePrefferedDarkTheme';

export const darkModeClass = 'dark-mode';
export const lightModeClass = 'light-mode';
export const isDarkThemeLocalStorageKey = 'isDarkThemeSelected';

export type DarkModeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

export const InitialDarkModeContext: DarkModeContextType = {
  isDarkMode: false,
  toggleDarkMode: () => console.error('Please provide this function'),
};

export const DarkModeContext = createContext<DarkModeContextType>(InitialDarkModeContext);

export const DarkModeContextProvider = (props: PropsWithChildren): ReactElement => {
  const { children } = props;
  const [isDarkThemeSelected, setIsDarkThemeSelected] = useLocalStorage<boolean | null>(
    isDarkThemeLocalStorageKey,
    null
  );
  const { isDarkTheme } = usePrefferedDarkTheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    isDarkThemeSelected !== null ? isDarkThemeSelected : isDarkTheme
  );

  useEffect(() => {
    setIsDarkMode(isDarkThemeSelected !== null ? isDarkThemeSelected : isDarkTheme);
  }, [isDarkTheme, isDarkThemeSelected]);

  const toggleDarkMode = (): void =>
    setIsDarkMode((prevVal) => {
      const newVal = !prevVal;
      setIsDarkThemeSelected(newVal);
      return newVal;
    });

  return (
    <DarkModeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = (): DarkModeContextType => {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove(lightModeClass);
      document.documentElement.classList.add(darkModeClass);
    } else {
      console.log('Nam data is: switching to light');
      document.documentElement.classList.remove(darkModeClass);
      document.documentElement.classList.add(lightModeClass);
    }
  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
};
