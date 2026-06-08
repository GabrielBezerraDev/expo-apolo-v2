import { useThemeMode } from "@shared/components/ThemeToggle";

type AppButtonVariant = "primary" | "secondary" | "outline" | "danger";

type UseAppButtonParams = {
  disabled?: boolean;
  loading?: boolean;
  variant: AppButtonVariant;
};

export function useAppButton({ disabled, loading, variant }: UseAppButtonParams) {
  const { theme } = useThemeMode();

  return {
    disabled: disabled || loading,
    loadingColor: variant === "primary" ? theme.white : theme.primary,
  };
}
