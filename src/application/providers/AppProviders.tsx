import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ModalProvider } from '@shared/components/Modal';
import { AppThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ff6200' }} edges={['top','bottom']}>
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <AppThemeProvider>
                <ModalProvider>{children}</ModalProvider>
            </AppThemeProvider>
          </View>
        </SafeAreaView>
      </SafeAreaProvider >
    </GestureHandlerRootView>
  );
}
