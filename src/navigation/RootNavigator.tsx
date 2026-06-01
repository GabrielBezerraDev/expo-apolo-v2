import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@config/navigation.protocol';
import { useThemeMode } from '@hooks/useThemeMode';
import { FrameProvider, FramedCameraScanner, useFrame } from '@features/scanner';
import { FormScreenPallet } from '@features/pallets/screens/form/FormScreenPallet';
import { PalletsEvidence } from '@features/pallets/screens/form/PalletsEvidence';
import { PalletProvider, usePallet } from '@features/pallets/providers/PalletProvider';
import { AuthNavigator } from './AuthNavigator';
import { MainTabsNavigator } from './MainTabsNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { mode, theme } = useThemeMode();
  const navTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.background,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {!loggedIn ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth">
            {() => <AuthNavigator onLogin={() => setLoggedIn(true)} />}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        <LoggedInStack />
      )}
    </NavigationContainer>
  );
}

function LoggedInStack() {
  return (
    <FrameProvider>
      <PalletProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabsNavigator} />
          <Stack.Screen name="FormScreenPallet" component={FormScreenPallet} />
          <Stack.Screen name="PalletsEvidence" component={PalletsEvidence} />
          <Stack.Screen name="Scanner" component={FramedCameraScanner} />
        </Stack.Navigator>
      </PalletProvider>
    </FrameProvider>
  );
}
