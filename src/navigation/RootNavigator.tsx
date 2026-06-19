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
import { NotificationBootstrap } from '@features/notifications';
import { ExitExtraEvidence, FormScreenPallet, OperationSuccess, PalletsEvidence } from '@features/pallets/screens/form';
import { PalletOperationSummary } from '@features/pallets/screens/summary';
import { RoadmapPhotosScreen } from '@features/pallets/screens/roadmap';
import { PalletProvider } from '@features/pallets/providers';
import { LottieAnimLoading } from '@shared/components/Feedback';
import { AuthSessionProvider, useAuthSession } from '@shared/services/authSession';
import { AuthNavigator } from './AuthNavigator';
import { MainTabsNavigator } from './MainTabsNavigator';
import { SocketProvider } from '@shared/services/socket';

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
    <SocketProvider>
      <NotificationBootstrap />
      <FrameProvider>
        <PalletProvider>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabsNavigator} />
            <Stack.Screen name="FormScreenPallet" component={FormScreenPallet} />
            <Stack.Screen name="PalletsEvidence" component={PalletsEvidence} />
            <Stack.Screen name="ExitExtraEvidence" component={ExitExtraEvidence} />
            <Stack.Screen name="PalletOperationSummary" component={PalletOperationSummary} />
            <Stack.Screen name="RoadmapPhotos" component={RoadmapPhotosScreen} />
            <Stack.Screen name="OperationSuccess" component={OperationSuccess} />
            <Stack.Screen name="Scanner" component={FramedCameraScanner} />
          </Stack.Navigator>
        </PalletProvider>
      </FrameProvider>
    </SocketProvider>
  );
}
