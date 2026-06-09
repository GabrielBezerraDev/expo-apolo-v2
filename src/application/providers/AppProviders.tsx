import React, { PropsWithChildren } from "react";
import { View } from "tamagui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { OcrFrameProvider } from "@features/camera";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { ModalProvider } from "@shared/components/Display/Modal";
import { AppQueryProvider } from "./QueryProvider";
import { AppThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <AppSafeArea>{children}</AppSafeArea>
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
          <OcrFrameProvider>
            <ModalProvider>{children}</ModalProvider>
          </OcrFrameProvider>
        </AppQueryProvider>
      </View>
    </SafeAreaView>
  );
}
