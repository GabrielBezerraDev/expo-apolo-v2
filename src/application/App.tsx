import React from 'react';
import { StatusBar } from 'react-native';
import { useThemeMode } from '@shared/components/Actions/ThemeToggle';
import { ForceUpdateBootstrap } from '@features/appUpdates';
import { RootNavigator } from '@navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';

function AppShell() {
  const { theme } = useThemeMode();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} translucent={false} />
      <ForceUpdateBootstrap />
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
