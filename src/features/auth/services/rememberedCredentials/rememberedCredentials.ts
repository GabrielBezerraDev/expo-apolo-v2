import * as SecureStore from "expo-secure-store";

type RememberedCredentials = {
  email: string;
  password: string;
};

const REMEMBERED_EMAIL_KEY = "valorlog.rememberedEmail";
const REMEMBERED_PASSWORD_KEY = "valorlog.rememberedPassword";

export async function getRememberedCredentials() {
  const [email, password] = await Promise.all([
    SecureStore.getItemAsync(REMEMBERED_EMAIL_KEY),
    SecureStore.getItemAsync(REMEMBERED_PASSWORD_KEY),
  ]);

  if (!email || !password) {
    await clearRememberedCredentials();
    return null;
  }

  return { email, password } satisfies RememberedCredentials;
}

export async function saveRememberedCredentials({ email, password }: RememberedCredentials) {
  await Promise.all([
    SecureStore.setItemAsync(REMEMBERED_EMAIL_KEY, email),
    SecureStore.setItemAsync(REMEMBERED_PASSWORD_KEY, password),
  ]);
}

export async function clearRememberedCredentials() {
  await Promise.all([
    SecureStore.deleteItemAsync(REMEMBERED_EMAIL_KEY),
    SecureStore.deleteItemAsync(REMEMBERED_PASSWORD_KEY),
  ]);
}
