import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PackageCheck, PackageOpen, Warehouse } from 'lucide-react-native';
import { MainTabsParamList } from '../config/navigation.protocol';
import { EntryListScreen } from '../features/pallets/screens/EntryListScreen';
import { ExitListScreen } from '../features/pallets/screens/ExitListScreen';
import { PalletListScreen } from '../features/pallets/screens/PalletListScreen';
import { useThemeMode } from '../hooks/useThemeMode';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export function MainTabsNavigator() {
  const { theme } = useThemeMode();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mode === 'dark' ? theme.mutedText : theme.text,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}>
      <Tab.Screen name="EntryList" component={EntryListScreen} options={{ title: 'Entrada', tabBarIcon: ({ color }) => <PackageOpen size={24} color={color} /> }} />
      <Tab.Screen name="ExitList" component={ExitListScreen} options={{ title: 'Saída', tabBarIcon: ({ color }) => <PackageCheck size={24} color={color} /> }} />
      <Tab.Screen name="PalletList" component={PalletListScreen} options={{ title: 'Pallets', tabBarIcon: ({ color }) => <Warehouse size={24} color={color} /> }} />
    </Tab.Navigator>
  );
}
