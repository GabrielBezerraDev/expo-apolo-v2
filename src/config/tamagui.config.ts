import { createTamagui, createTokens } from 'tamagui';
import { darkTheme, lightTheme } from '@shared/theme';

const tokens = createTokens({
  color: {
    orange: '#ff6200ff',
    orangeDark: '#d94f00',
    white: '#ffffff',
    black: '#000000',
    gray100: '#f6f3f7',
    gray200: '#f2f2f2',
    gray400: '#dedede',
    gray700: '#333333',
    gray900: '#111111',
    transparent: '#00000000'
  },
  space: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, true: 16 },
  size: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 10: 40, 12: 48, 14: 56, true: 16 },
  radius: { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 },
  zIndex: { 0: 0, 1: 1, 10: 10, 100: 100 },
});

export const config = createTamagui({
  tokens,
  themes: {
    light: {
      ...lightTheme,
      color: lightTheme.text,
      borderColor: lightTheme.border,
    },
    dark: {
      ...darkTheme,
      color: darkTheme.text,
      borderColor: darkTheme.border,
    },
  },
  shorthands: {
    bg: 'backgroundColor',
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    mx: 'marginHorizontal',
    my: 'marginVertical',
  } as const,
});

export const tamaguiConfig = config;

export default config;

export type AppTamaguiConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}
