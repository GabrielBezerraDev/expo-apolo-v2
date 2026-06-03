import React, { useCallback, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@config/navigation.protocol';
import { useThemeMode } from '@hooks/useThemeMode';
import { FrameProvider, FramedCameraScanner } from '@features/camera';
import { FormScreenPallet } from '@features/pallets/screens/form/FormScreenPallet';
import { OperationSuccess } from '@features/pallets/screens/form/OperationSuccess';
import { PalletsEvidence } from '@features/pallets/screens/form/PalletsEvidence';
import { ShipGoods } from '@features/pallets/screens/form/ShipGoods';
import { PalletProvider } from '@features/pallets/providers/PalletProvider';
import { PaginationProvider } from '@shared/components/Pagination';
import { AuthSessionProvider } from './AuthSessionContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabsNavigator } from './MainTabsNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { mode, theme } = useThemeMode();
  const login = useCallback(() => setLoggedIn(true), []);
  const logout = useCallback(() => setLoggedIn(false), []);
  const navTheme = {
    ...(mode === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.background,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <AuthSessionProvider login={login} logout={logout}>
      <NavigationContainer theme={navTheme}>
        {!loggedIn ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth">
              {() => <AuthNavigator onLogin={login} />}
            </Stack.Screen>
          </Stack.Navigator>
        ) : (
          <LoggedInStack />
        )}
      </NavigationContainer>
    </AuthSessionProvider>
  );
}

function LoggedInStack() {
  return (
    <FrameProvider>
      <PalletProvider>
        <PaginationProvider>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabsNavigator} />
            <Stack.Screen name="FormScreenPallet" component={FormScreenPallet} />
            <Stack.Screen name="PalletsEvidence" component={PalletsEvidence} />
            <Stack.Screen name="ShipGoods" component={ShipGoods} />
            <Stack.Screen name="OperationSuccess" component={OperationSuccess} />
            <Stack.Screen name="Scanner" component={FramedCameraScanner} />
          </Stack.Navigator>
        </PaginationProvider>
      </PalletProvider>
    </FrameProvider>
  );
}
