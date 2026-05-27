import React from 'react';
import { Pressable } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useThemeMode } from '../hooks/useThemeMode';

export function ThemeToggle() {
  const { mode, theme, toggleTheme } = useThemeMode();

  return (
    <Pressable onPress={toggleTheme} hitSlop={10}>
      {mode === 'dark' ? <Sun size={20} color={theme.primary} /> : <Moon size={20} color={theme.primary} />}
    </Pressable>
  );
}
