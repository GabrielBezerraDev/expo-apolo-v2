import React from 'react';
import { StatusBar } from 'react-native';
import { ForceUpdateBootstrap } from '@features/appUpdates';
import { RootNavigator } from '@navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';

function AppShell() {
  return (
    <>
      <StatusBar barStyle="light-content" />
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
