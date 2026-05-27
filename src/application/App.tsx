import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useThemeMode } from '@hooks/useThemeMode';
import { RootNavigator } from '@navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';

function AppShell() {
  const { mode } = useThemeMode();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
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
