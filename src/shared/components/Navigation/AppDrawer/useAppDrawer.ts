import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useAuthSession } from "@shared/services/authSession";
import { useApiClient } from "@shared/services/apiClient";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { unregisterCurrentDevicePushToken } from "@shared/services/pushNotifications";
import { useAppDrawerAnimation } from "./useAppDrawerAnimation";

type UseAppDrawerParams = {
  onClose: () => void;
  visible: boolean;
};

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function useAppDrawer({ onClose, visible }: UseAppDrawerParams) {
  const { theme } = useThemeMode();
  const navigation = useNavigation<Navigation>();
  const apiClient = useApiClient();
  const { logout } = useAuthSession();
  const { backdropStyle, closeWithAnimation, panelStyle } = useAppDrawerAnimation(visible);

  const closeDrawer = () => {
    closeWithAnimation(onClose);
  };

  const handleLogout = () => {
    closeWithAnimation(() => {
      onClose();
      void (async () => {
        try {
          await unregisterCurrentDevicePushToken(apiClient);
        } catch (error) {
          console.warn(
            "Nao foi possivel remover o registro de notificacoes.",
            error instanceof Error ? error.message : error,
          );
        } finally {
          await logout();
        }
      })();
    });
  };

  const handleOpenManual = () => {
    closeWithAnimation(() => {
      onClose();
      navigation.navigate("Manual");
    });
  };

  return {
    backdropStyle,
    closeDrawer,
    handleLogout,
    handleOpenManual,
    panelStyle,
    theme,
  };
}
