export const lightTheme = {
  mode: 'light',
  background: 'rgb(255, 255, 255)',
  surface: '#f6f3f7',
  card: '#f2f2f2',
  text: '#1f1f1f',
  mutedText: '#7a7a7a',
  border: '#dedede',
  primary: '#ff6200ff',
  primaryDark: '#d94f00',
  primaryLight: '#fabb80',
  error: '#d32f2f',
  success: '#2e7d32',
  greenLight: '#2ed133',
  warning: '#f9a825',
  white: '#ffffff',
  grey: '#5f5e5e',
  black: '#000000',
  bege: '#F5F5DC'
};

export const darkTheme = {
  mode: 'dark',
  background: '#2b2a2a',
  surface: '#1b1b1b',
  card: '#242424',
  text: '#ffffff',
  mutedText: '#b8b8b8',
  border: '#333333',
  primary: '#ff6200ff',
  primaryDark: '#d94f00',
  primaryLight: '#fabb80',
  error: '#ff6b6b',
  success: '#66bb6a',
  greenLight: '#2ed133',
  warning: '#ffca28',
  white: '#ffffff',
  grey: '#5f5e5e',
  black: '#000000',
  bege: '#F5F5DC'
};

export type AppTheme = typeof lightTheme;
export type ThemeMode = 'light' | 'dark';

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};
