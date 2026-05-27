import { createContext, useContext } from 'react';
import { AppTheme, ThemeMode, lightTheme } from '@shared/theme';

export type ThemeModeContextValue = {
  mode: ThemeMode;
  theme: AppTheme;
  toggleTheme: () => void;
};

export const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'light',
  theme: lightTheme,
  toggleTheme: () => undefined,
});

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
