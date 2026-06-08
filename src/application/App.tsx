import React from 'react';
import { StatusBar } from 'react-native';
import { useThemeMode } from '@shared/components/ThemeToggle';
import { RootNavigator } from '@navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';

function AppShell() {
  const { theme } = useThemeMode();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} translucent={false} />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}
