import { useAuthSession } from "@shared/services/authSession";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { useFeedbackModal } from "@shared/components/Display/Modal";
import { useAppDrawerAnimation } from "./useAppDrawerAnimation";

type UseAppDrawerParams = {
  onClose: () => void;
  visible: boolean;
};

export function useAppDrawer({ onClose, visible }: UseAppDrawerParams) {
  const { theme } = useThemeMode();
  const { forgetCurrentUser, logout } = useAuthSession();
  const { showConfirm, showFeedback } = useFeedbackModal();
  const { backdropStyle, closeWithAnimation, panelStyle } = useAppDrawerAnimation(visible);

  const closeDrawer = () => {
    closeWithAnimation(onClose);
  };

  const handleLogout = () => {
    closeWithAnimation(() => {
      onClose();
      void logout().catch(() => {
        showFeedback({
          message: "Não foi possível encerrar a sessão local. Tente novamente.",
          title: "Falha ao sair",
        });
      });
    });
  };

  const handleForgetCurrentUser = () => {
    closeWithAnimation(() => {
      onClose();
      showConfirm({
        confirmLabel: "Esquecer usuário",
        message: "O acesso offline deste usuário será removido. Para entrar novamente, será necessário fazer login com internet.",
        onConfirm: async () => {
          try {
            await forgetCurrentUser();
          } catch {
            showFeedback({
              message: "Não foi possível remover completamente o acesso offline deste usuário.",
              title: "Falha ao esquecer usuário",
            });
          }
        },
        title: "Esquecer usuário?",
      });
    });
  };

  return {
    backdropStyle,
    closeDrawer,
    handleForgetCurrentUser,
    handleLogout,
    panelStyle,
    theme,
  };
}
