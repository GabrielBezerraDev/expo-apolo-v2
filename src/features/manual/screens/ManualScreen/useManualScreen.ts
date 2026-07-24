import { useCallback, useEffect, useRef, useState } from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { useAppHeaderConfig } from "@shared/components/Navigation/AppHeader";
import { getLocalManualUri } from "../../services";

type Navigation = NativeStackNavigationProp<RootStackParamList, "Manual">;

export function useManualScreen(navigation: Navigation) {
  const { theme } = useThemeMode();
  const requestIdRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [manualUri, setManualUri] = useState<string | null>(null);
  const [rendererFailed, setRendererFailed] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  useAppHeaderConfig({
    title: "Manual do Usuário",
    showBack: true,
    onBack: goBack,
  });

  const loadDocument = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setCurrentPage(0);
    setErrorMessage(null);
    setIsLoading(true);
    setManualUri(null);
    setRendererFailed(false);
    setTotalPages(0);

    try {
      const uri = await getLocalManualUri();
      if (requestId !== requestIdRef.current) return;

      setManualUri(uri);
    } catch {
      if (requestId !== requestIdRef.current) return;

      setErrorMessage("Não foi possível carregar o arquivo local do manual.");
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocument();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadDocument]);

  const handlePageChange = (page: number, total: number) => {
    setCurrentPage(page + 1);
    setTotalPages(total);
  };

  const handleRendererError = () => {
    setRendererFailed(true);
  };

  const retryDocument = () => {
    void loadDocument();
  };

  return {
    currentPage,
    errorMessage,
    handlePageChange,
    handleRendererError,
    isLoading,
    manualUri,
    rendererFailed,
    retryDocument,
    theme,
    totalPages,
  };
}
