import * as SecureStore from "expo-secure-store";

type RememberedCredentials = {
  email: string;
  password: string;
};

const REMEMBERED_EMAIL_KEY = "valorlog.rememberedEmail";
const REMEMBERED_PASSWORD_KEY = "valorlog.rememberedPassword";
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function getRememberedCredentials() {
  const [email, password] = await Promise.all([
    SecureStore.getItemAsync(REMEMBERED_EMAIL_KEY),
    SecureStore.getItemAsync(REMEMBERED_PASSWORD_KEY),
  ]);

  return email
    ? { email, password: password ?? "" } satisfies RememberedCredentials
    : null;
}

export async function saveRememberedCredentials({ email, password }: RememberedCredentials) {
  await Promise.all([
    SecureStore.setItemAsync(REMEMBERED_EMAIL_KEY, email, SECURE_STORE_OPTIONS),
    SecureStore.setItemAsync(REMEMBERED_PASSWORD_KEY, password, SECURE_STORE_OPTIONS),
  ]);
}

export async function clearRememberedCredentials() {
  await Promise.all([
    SecureStore.deleteItemAsync(REMEMBERED_EMAIL_KEY),
    SecureStore.deleteItemAsync(REMEMBERED_PASSWORD_KEY),
  ]);
}
