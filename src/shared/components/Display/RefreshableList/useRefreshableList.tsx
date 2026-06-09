import React from "react";
import { RefreshControl } from "react-native";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";

type UseRefreshableListParams = {
  dataLength: number;
  emptyMessage?: string;
  errorMessage?: string;
  isError?: boolean;
  isLoading?: boolean;
  isRefreshing?: boolean;
  loadingLabel?: string;
  onRefresh?: () => void;
};

export function useRefreshableList({
  dataLength,
  emptyMessage = "Nenhum registro encontrado.",
  errorMessage = "Não foi possível carregar os dados.",
  isError = false,
  isLoading = false,
  isRefreshing = false,
  loadingLabel = "Carregando",
  onRefresh,
}: UseRefreshableListParams) {
  const { theme } = useThemeMode();
  const showLoading = isLoading && !isRefreshing;
  const showError = !showLoading && isError;
  const showEmpty = !showLoading && !showError && dataLength === 0;
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefresh}
      colors={[theme.primary]}
      tintColor={theme.primary}
    />
  ) : undefined;

  return {
    emptyMessage,
    errorMessage,
    loadingLabel,
    refreshControl,
    showEmpty,
    showError,
    showLoading,
  };
}
