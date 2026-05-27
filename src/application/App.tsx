import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from '../navigation/RootNavigator';
import { useThemeMode } from '../hooks/useThemeMode';

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
