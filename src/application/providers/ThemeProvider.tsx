import React, { PropsWithChildren, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { TamaguiProvider, Theme } from 'tamagui';
import tamaguiConfig from '@config/tamagui.config';
import { appThemes, ThemeMode, ThemeModeContext } from '@shared/theme';

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemMode = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemMode === 'dark' ? 'dark' : 'light');

  const value = useMemo(
    () => ({
      mode,
      theme: appThemes[mode],
      toggleTheme: () => setMode(current => (current === 'light' ? 'dark' : 'light')),
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={mode}>
        <Theme name={mode}>{children}</Theme>
      </TamaguiProvider>
    </ThemeModeContext.Provider>
  );
}
