let currentDevicePushToken: string | undefined;

export function getCurrentDevicePushToken() {
  return currentDevicePushToken;
}

export function setCurrentDevicePushToken(token?: string) {
  currentDevicePushToken = token?.trim() || undefined;
}
