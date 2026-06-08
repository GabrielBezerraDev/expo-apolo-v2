import { Moon, Sun } from "lucide-react-native";
import { useThemeMode } from "./useThemeMode";

export function useThemeToggle() {
  const { mode, theme, toggleTheme } = useThemeMode();
  const Icon = mode === "dark" ? Sun : Moon;

  return {
    Icon,
    theme,
    toggleTheme,
  };
}
