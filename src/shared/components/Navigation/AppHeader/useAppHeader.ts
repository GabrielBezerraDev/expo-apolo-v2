import { useState } from "react";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { useAppHeaderContext } from "./AppHeaderProvider";

type UseAppHeaderParams = {
  navigation: NativeStackHeaderProps["navigation"];
};

export function useAppHeader({ navigation }: UseAppHeaderParams) {
  const { theme } = useThemeMode();
  const { headerConfig } = useAppHeaderContext();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleBackPress = () => {
    if (headerConfig.onBack) {
      headerConfig.onBack();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleMenuPress = () => {
    if (headerConfig.onMenu) {
      headerConfig.onMenu();
      return;
    }

    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  return {
    closeDrawer,
    drawerVisible,
    handleBackPress,
    handleMenuPress,
    headerConfig,
    theme,
  };
}
