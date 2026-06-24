import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useAuthSession } from "@shared/services/authSession";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { useAppDrawerAnimation } from "./useAppDrawerAnimation";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type UseAppDrawerParams = {
  onClose: () => void;
  visible: boolean;
};

export function useAppDrawer({ onClose, visible }: UseAppDrawerParams) {
  const navigation = useNavigation<Navigation>();
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

  const handleOpenOfflineSyncReview = () => {
    closeWithAnimation(() => {
      onClose();
      navigation.navigate("OfflineSyncReview");
    });
  };

  return {
    backdropStyle,
    closeDrawer,
    handleOpenOfflineSyncReview,
    handleLogout,
    panelStyle,
    theme,
  };
}
