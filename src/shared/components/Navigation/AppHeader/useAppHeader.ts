import { useState } from "react";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";

type UseAppHeaderParams = {
  onMenu?: () => void;
};

export function useAppHeader({ onMenu }: UseAppHeaderParams) {
  const { theme } = useThemeMode();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleMenuPress = () => {
    if (onMenu) {
      onMenu();
      return;
    }

    setDrawerVisible(true);
  };

  const closeDrawer = () => {}

  return {
    closeDrawer,
    drawerVisible,
    handleMenuPress,
    theme,
  };
}
