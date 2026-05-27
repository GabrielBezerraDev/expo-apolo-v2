import React from "react";
import { Moon, Sun } from "lucide-react-native";
import { useThemeMode } from "@hooks/useThemeMode";
import { ToggleButton } from "./styled";

export function ThemeToggle() {
  const { mode, theme, toggleTheme } = useThemeMode();

  return (
    <ToggleButton onPress={toggleTheme} hitSlop={10}>
      {mode === "dark" ? <Sun size={20} color={theme.primary} /> : <Moon size={20} color={theme.primary} />}
    </ToggleButton>
  );
}
