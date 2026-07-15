import { useEffect, useRef } from "react";
import { requireNativeModule } from "expo";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { useApiClient } from "@shared/services/apiClient";
import { useNetworkState } from "@shared/services/network";
import {
  isDevicePushTokenSessionEnding,
  registerCurrentDevicePushToken,
  setCurrentDevicePushToken,
  startDevicePushTokenSession,
} from "@shared/services/pushNotifications";

const DEFAULT_NOTIFICATION_CHANNEL = "default";
const INITIALIZATION_RETRY_DELAYS_MS = [0, 2_000, 5_000, 10_000];
const REGISTRATION_RETRY_DELAYS_MS = [0, 2_000, 5_000, 10_000];

export function usePushNotifications() {
  const apiClient = useApiClient();
  const { hasCheckedNetwork, isOnline } = useNetworkState();
  const lastRegisteredTokenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    startDevicePushTokenSession();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    let active = true;
    let tokenSubscription: Notifications.EventSubscription | undefined;

    const registerDeviceToken = async (deviceToken: Notifications.DevicePushToken) => {
      if (
        !active ||
        isDevicePushTokenSessionEnding() ||
        deviceToken.type !== "android" ||
        typeof deviceToken.data !== "string"
      ) {
        return;
      }

      const token = deviceToken.data.trim();
      if (!token) return;

      setCurrentDevicePushToken(token);

      if (!hasCheckedNetwork || !isOnline || lastRegisteredTokenRef.current === token) {
        return;
      }

      let lastError: unknown;

      for (const retryDelayMs of REGISTRATION_RETRY_DELAYS_MS) {
        if (retryDelayMs > 0) await wait(retryDelayMs);
        if (!active || isDevicePushTokenSessionEnding()) return;

        try {
          const registered = await registerCurrentDevicePushToken(apiClient, token);
          if (!registered || !active) return;

          lastRegisteredTokenRef.current = token;
          return;
        } catch (error) {
          lastError = error;
        }
      }

      if (active) {
        console.warn(
          "Nao foi possivel registrar este dispositivo para notificacoes.",
          lastError instanceof Error ? lastError.message : lastError,
        );
      }
    };

    const initializePushNotifications = async () => {
      let lastError: unknown;

      for (const retryDelayMs of INITIALIZATION_RETRY_DELAYS_MS) {
        if (retryDelayMs > 0) await wait(retryDelayMs);
        if (!active || isDevicePushTokenSessionEnding()) return;

        try {
          await Notifications.setNotificationChannelAsync(DEFAULT_NOTIFICATION_CHANNEL, {
            name: "Atualizacoes do Apollo",
            importance: Notifications.AndroidImportance.HIGH,
            sound: "default",
            vibrationPattern: [0, 250, 250, 250],
          });

          const currentPermissions = await Notifications.getPermissionsAsync();
          const permissions = currentPermissions.granted
            ? currentPermissions
            : await Notifications.requestPermissionsAsync();

          if (!active || !permissions.granted || isDevicePushTokenSessionEnding()) return;

          const deviceToken = await getAndroidDevicePushTokenAsync();
          if (!active || isDevicePushTokenSessionEnding()) return;

          tokenSubscription = Notifications.addPushTokenListener(token => {
            void registerDeviceToken(token);
          });
          void registerDeviceToken(deviceToken);
          return;
        } catch (error) {
          lastError = error;
        }
      }

      if (active && !isDevicePushTokenSessionEnding()) {
        console.warn(
          "Nao foi possivel inicializar as notificacoes.",
          lastError instanceof Error ? lastError.message : lastError,
        );
      }
    };

    void initializePushNotifications();

    return () => {
      active = false;
      tokenSubscription?.remove();
    };
  }, [apiClient, hasCheckedNetwork, isOnline]);
}

function wait(milliseconds: number) {
  return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}

async function getAndroidDevicePushTokenAsync(): Promise<Notifications.DevicePushToken> {
  // Expo SDK 54 caches rejected token promises, so retries must call the native module directly.
  const tokenManager = requireNativeModule<{
    getDevicePushTokenAsync: () => Promise<string>;
  }>("ExpoPushTokenManager");

  return {
    data: await tokenManager.getDevicePushTokenAsync(),
    type: "android",
  };
}
