import React, { PropsWithChildren } from "react";
import { View } from "tamagui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { ModalProvider } from "@shared/components/Display/Modal";
import { AuthSessionProvider } from "@shared/services/authSession";
import { NetworkProvider } from "@shared/services/network";
import { AppQueryProvider } from "./QueryProvider";
import { AppThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <NetworkProvider>
            <AppSafeArea>{children}</AppSafeArea>
          </NetworkProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppSafeArea({ children }: PropsWithChildren) {
  const { theme } = useThemeMode();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.primary }}
      edges={["top", "bottom"]}
    >
      <View flex={1} backgroundColor="$black">
        <AppQueryProvider>
          <AuthSessionProvider>
            <ModalProvider>{children}</ModalProvider>
          </AuthSessionProvider>
        </AppQueryProvider>
      </View>
    </SafeAreaView>
  );
}
