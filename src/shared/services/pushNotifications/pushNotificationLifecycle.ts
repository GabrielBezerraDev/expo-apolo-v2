import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { ApiClient } from "@shared/services/apiClient";
import {
  getCurrentDevicePushToken,
  setCurrentDevicePushToken,
} from "./devicePushToken";

type DeviceTokenResponse = {
  ok: boolean;
};

let isSessionEnding = false;
let registrationQueue: Promise<void> = Promise.resolve();
const registeredDevicePushTokens = new Set<string>();
const sessionDevicePushTokens = new Set<string>();

export function startDevicePushTokenSession() {
  isSessionEnding = false;
  setCurrentDevicePushToken();
  registeredDevicePushTokens.clear();
  sessionDevicePushTokens.clear();
}

export function isDevicePushTokenSessionEnding() {
  return isSessionEnding;
}

export async function registerCurrentDevicePushToken(apiClient: ApiClient, token: string) {
  sessionDevicePushTokens.add(token);

  const registration = registrationQueue.then(async () => {
    if (isSessionEnding) return false;
    if (registeredDevicePushTokens.has(token)) return true;

    await apiClient.post<DeviceTokenResponse, { platform: "ANDROID"; token: string }>(
      "/device-tokens",
      { body: { platform: "ANDROID", token } },
    );

    registeredDevicePushTokens.add(token);
    return true;
  });

  registrationQueue = registration.then(
    () => undefined,
    () => undefined,
  );

  return registration;
}

export async function unregisterCurrentDevicePushToken(apiClient: ApiClient) {
  isSessionEnding = true;
  await registrationQueue;

  const currentToken = getCurrentDevicePushToken();
  if (currentToken) sessionDevicePushTokens.add(currentToken);

  const tokens = [...sessionDevicePushTokens];
  setCurrentDevicePushToken();

  const cleanupRequests: Promise<unknown>[] = tokens.map(token =>
    apiClient.delete<DeviceTokenResponse, { token: string }>("/device-tokens", {
      body: { token },
    }),
  );

  if (Platform.OS === "android") {
    cleanupRequests.push(Notifications.unregisterForNotificationsAsync());
  }

  const results = await Promise.allSettled(cleanupRequests);
  const failedResult = results.find(result => result.status === "rejected");

  registeredDevicePushTokens.clear();
  sessionDevicePushTokens.clear();

  if (failedResult?.status === "rejected") {
    throw failedResult.reason;
  }
}
