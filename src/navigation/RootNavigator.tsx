import React, { PropsWithChildren, ReactNode, useEffect, useMemo } from "react";
import { View } from "tamagui";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation/navigation.protocol";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { FrameProvider, FramedCameraScanner } from "@features/camera";
import { PasswordChangeBootstrap } from "@features/auth";
import { NotificationBootstrap } from "@features/notifications";
import { PalletProvider } from "@features/pallets/providers";
import { LottieAnimLoading } from "@shared/components/Feedback";
import {
  AppHeader,
  AppHeaderProvider,
} from "@shared/components/Navigation/AppHeader";
import { useAuthSession } from "@shared/services/authSession";
import { AuthNavigator } from "./AuthNavigator";
import { MainTabsNavigator } from "./MainTabsNavigator";
import { SocketProvider } from "@shared/services/socket";
import { WorkStage } from "../shared/services/authSession/AuthSessionContext";
import { DefaultStack } from "./Stack/DefaultStack";
import { CycleCountStack } from "./Stack/CycleCountStack";

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
    <NavigationContainer theme={navTheme}>
      <RootNavigatorContent />
    </NavigationContainer>
  );
}

function RootNavigatorContent() {
  const { status } = useAuthSession();

  if (status === "loading") {
    return (
      <View flex={1} alignItems="center" justifyContent="center">
        <LottieAnimLoading label="Carregando aplicativo" />
      </View>
    );
  }

  if (status === "signedOut") {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  if (status === "passwordChangeRequired") {
    return (
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
      >
        <PasswordChangeBootstrap />
        <LottieAnimLoading label="Atualizando segurança da conta" />
      </View>
    );
  }

  return <LoggedInStack />;
}

function LoggedInStack() {
  const { userWorkStage } = useAuthSession();

  const RedirectByWorkStage = () => {
    const routes = new Map<WorkStage | "DEFAULT", ReactNode>([
      [
        "DEFAULT",
        <PalletProvider>
          <FrameProvider>
            <DefaultStack Stack={Stack} />
          </FrameProvider>
        </PalletProvider>,
      ],
      ["CYCLE_COUNT", <CycleCountStack Stack={Stack} />],
    ]);

    return routes.get(userWorkStage as WorkStage) ?? routes.get("DEFAULT");
  };

  return (
    <AppHeaderProvider>
      <SocketProvider>
        <NotificationBootstrap />
        <RedirectByWorkStage />
      </SocketProvider>
    </AppHeaderProvider>
  );
}
