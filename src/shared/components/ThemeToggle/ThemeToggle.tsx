import React from "react";
import { ToggleButton } from "./styled";
import { useThemeToggle } from "./useThemeToggle";
import { fontScale } from "@shared/typography";

export function ThemeToggle() {
  const { Icon, theme, toggleTheme } = useThemeToggle();

  return (
    <ToggleButton onPress={toggleTheme} hitSlop={10}>
      <Icon size={20 * fontScale} color={theme.primary} />
    </ToggleButton>
  );
}
