import * as SecureStore from "expo-secure-store";

const BLOCKED_OFFLINE_AUTH_KEY_PREFIX = "apollo.blockedOfflineAuth";

export function isOfflineAuthBlocked(userId: number) {
  return SecureStore.getItemAsync(getBlockedOfflineAuthKey(userId)).then(Boolean);
}

export function blockOfflineAuth(userId: number) {
  return SecureStore.setItemAsync(getBlockedOfflineAuthKey(userId), "1");
}

export function clearOfflineAuthBlock(userId: number) {
  return SecureStore.deleteItemAsync(getBlockedOfflineAuthKey(userId));
}

function getBlockedOfflineAuthKey(userId: number) {
  return `${BLOCKED_OFFLINE_AUTH_KEY_PREFIX}.${userId}`;
}
