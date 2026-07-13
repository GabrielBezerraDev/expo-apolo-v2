import { useCallback, useEffect, useState } from "react";
import { AppUpdateInfo, getAvailableAppUpdate } from "../services/appUpdateService";
import { Alert } from "react-native";

export function useAppUpdateChecker() {
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null);

  const checkForUpdate = useCallback(async () => {
    setError(null);
    setIsChecking(true);

    try {
      setUpdate(await getAvailableAppUpdate());
    } catch (checkError) {
      console.log(JSON.stringify(checkError));
      // Alert.alert('ERRO FUDIDO');
      setError(checkError instanceof Error ? checkError.message : "Não foi possível verificar atualizações.");
      setUpdate(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkForUpdate();
  }, [checkForUpdate]);

  return {
    checkForUpdate,
    error,
    hasUpdate: Boolean(update),
    isChecking,
    update,
  };
}
