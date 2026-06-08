import { useAuthSession } from "@navigation/AuthSessionContext";
import { useThemeMode } from "@shared/components/ThemeToggle";
import { useAppDrawerAnimation } from "./useAppDrawerAnimation";

type UseAppDrawerParams = {
  onClose: () => void;
  visible: boolean;
};

export function useAppDrawer({ onClose, visible }: UseAppDrawerParams) {
  const { theme } = useThemeMode();
  const { logout } = useAuthSession();
  const { backdropStyle, closeWithAnimation, panelStyle } = useAppDrawerAnimation(visible);

  const closeDrawer = () => {
    closeWithAnimation(onClose);
  };

  const handleLogout = () => {
    closeWithAnimation(() => {
      onClose();
      logout();
    });
  };

  return {
    backdropStyle,
    closeDrawer,
    handleLogout,
    panelStyle,
    theme,
  };
}
