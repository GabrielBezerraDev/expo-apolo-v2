import React from 'react';
import { View } from 'tamagui';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/navigation.protocol';
import { useThemeMode } from '@shared/components/Actions/ThemeToggle';
import { FrameProvider, FramedCameraScanner } from '@features/camera';
import { FormScreenPallet } from '@features/pallets/screens/form/FormScreenPallet';
import { OperationSuccess } from '@features/pallets/screens/form/OperationSuccess';
import { PalletsEvidence } from '@features/pallets/screens/form/PalletsEvidence';
import { ExitExtraEvidence } from '@features/pallets/screens/form/ExitExtraEvidence';
import { PalletOperationSummary } from '@features/pallets/screens/summary/PalletOperationSummary';
import { PalletProvider } from '@features/pallets/providers/PalletProvider';
import { LottieAnimLoading } from '@shared/components/Feedback';
import { PaginationProvider } from '@shared/components/Navigation/Pagination';
import { AuthSessionProvider, useAuthSession } from './AuthSessionContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabsNavigator } from './MainTabsNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { mode, theme } = useThemeMode();
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
    <AuthSessionProvider>
      <NavigationContainer theme={navTheme}>
        <RootNavigatorContent />
      </NavigationContainer>
    </AuthSessionProvider>
  );
}

function RootNavigatorContent() {
  const { isAuthenticated, isLoading } = useAuthSession();

  if (isLoading) {
    return (
      <View flex={1} alignItems="center" justifyContent="center">
        <LottieAnimLoading label="Carregando aplicativo" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  return <LoggedInStack />;
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
            <Stack.Screen name="ExitExtraEvidence" component={ExitExtraEvidence} />
            <Stack.Screen name="PalletOperationSummary" component={PalletOperationSummary} />
            <Stack.Screen name="OperationSuccess" component={OperationSuccess} />
            <Stack.Screen name="Scanner" component={FramedCameraScanner} />
          </Stack.Navigator>
        </PaginationProvider>
      </PalletProvider>
    </FrameProvider>
  );
}
