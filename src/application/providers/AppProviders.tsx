import React, { PropsWithChildren } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ModalProvider } from "@shared/components/Modal";
import { AppThemeProvider } from "./ThemeProvider";
<<<<<<< HEAD
=======
import { FrameProvider } from "@hooks/useFrame";
>>>>>>> 45cd1c715df9c891981b594bb62af9863957d30d

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#ff6200" }}
          edges={["top", "bottom"]}
        >
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <AppThemeProvider>
              <FrameProvider>
                <ModalProvider>{children}</ModalProvider>
              </FrameProvider>
            </AppThemeProvider>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
