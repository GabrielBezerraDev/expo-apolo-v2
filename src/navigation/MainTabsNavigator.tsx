import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Package, PackageOpen, Truck } from "lucide-react-native";
import { MainTabsParamList } from "@config/navigation.protocol";
import { EntryListScreen } from "@features/pallets/screens/list/EntryListScreen";
import { ExitListScreen } from "@features/pallets/screens/list/ExitListScreen";
import { PalletListScreen } from "@features/pallets/screens/list/PalletListScreen";
import { useThemeMode } from "@hooks/useThemeMode";
import { OutlinedTabIcon } from "@shared/components/OutlinedTabIcon";

const Tab = createBottomTabNavigator<MainTabsParamList>();


export function MainTabsNavigator() {
  const { theme } = useThemeMode();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.white,
        tabBarInactiveTintColor: theme.primaryLight,
        tabBarStyle: {
          backgroundColor: theme.primary,
          borderTopColor: theme.border,
          shadowRadius: 12,
          shadowOffset: { width: 3, height: 10 },
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
      }}
    >
      <Tab.Screen
        name="EntryList"
        component={EntryListScreen}
        options={{
          title: "Entrada",
          tabBarIcon: ({ color, focused }) => (
            <OutlinedTabIcon
              Icon={PackageOpen}
              color={color}
              outlineColor={theme.black}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ExitList"
        component={ExitListScreen}
        options={{
          title: "Saída",
          tabBarIcon: ({ color, focused }) => (
            <OutlinedTabIcon
              Icon={Truck}
              color={color}
              outlineColor={theme.black}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="PalletList"
        component={PalletListScreen}
        options={{
          title: "Pallets",
          tabBarIcon: ({ color, focused }) => (
            <OutlinedTabIcon
              Icon={Package}
              color={color}
              outlineColor={theme.black}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
