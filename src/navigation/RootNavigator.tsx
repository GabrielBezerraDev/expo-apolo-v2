import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../config/navigation.protocol';
import { useThemeMode } from '../hooks/useThemeMode';
import { AuthNavigator } from './AuthNavigator';
import { MainTabsNavigator } from './MainTabsNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { mode, theme } = useThemeMode();
  const navTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.background,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!loggedIn ? (
          <Stack.Screen name="Auth">
            {() => <AuthNavigator onLogin={() => setLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={MainTabsNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
