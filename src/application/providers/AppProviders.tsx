import React, { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppThemeProvider } from './ThemeProvider';
import { ModalProvider } from '../../shared/components/Modal';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
         <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top', 'bottom']}>
          <AppThemeProvider>
            <ModalProvider>{children}</ModalProvider>
          </AppThemeProvider>
         </SafeAreaView>
      </SafeAreaProvider >
    </GestureHandlerRootView>
  );
}
