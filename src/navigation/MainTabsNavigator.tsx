import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Package, PackageOpen, Truck } from "lucide-react-native";
import { MainTabsParamList } from "@navigation/navigation.protocol";
import { OfflineSyncBootstrap } from "@features/pallets/components";
import { OperationListScreen, PalletListScreen } from "@features/pallets/screens/list";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { OutlinedTabIcon } from "@shared/components/Navigation/OutlinedTabIcon";
import { typography } from "@shared/typography";

const Tab = createBottomTabNavigator<MainTabsParamList>();

function EntryListTab() {
  return <OperationListScreen operationType="entry" />;
}

function ExitListTab() {
  return <OperationListScreen operationType="exit" />;
}

export function MainTabsNavigator() {
  const { theme } = useThemeMode();

  return (
    <>
    <OfflineSyncBootstrap />
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.white,
        tabBarInactiveTintColor: theme.primaryLight,
        tabBarStyle: {
          backgroundColor: theme.primary,
          borderColor: theme.primaryDark,
          shadowRadius: 12,
          shadowOffset: { width: 3, height: 10 },
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { ...typography.bodySmall, fontWeight: "700" },
      }}
    >
      <Tab.Screen
        name="EntryList"
        component={EntryListTab}
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
        component={ExitListTab}
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
          title: "Paletes",
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
    </>
  );
}
