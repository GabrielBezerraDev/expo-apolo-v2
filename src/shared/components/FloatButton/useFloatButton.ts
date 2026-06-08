import { useState } from "react";
import { useThemeMode } from "@shared/components/ThemeToggle";
import { FloatButtonAction } from "./types";

type UseFloatButtonParams = {
  actionsLength: number;
};

type UseFloatActionButtonParams = {
  action: FloatButtonAction;
  onActionPress: () => void;
};

export function useFloatButton({ actionsLength }: UseFloatButtonParams) {
  const { theme } = useThemeMode();
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);
  const toggleOpen = () => setIsOpen(current => !current);

  return {
    close,
    isOpen,
    shouldRender: actionsLength > 0,
    theme,
    toggleOpen,
  };
}

export function useFloatActionButton({ action, onActionPress }: UseFloatActionButtonParams) {
  const { theme } = useThemeMode();

  const handlePress = () => {
    if (action.disabled) return;

    action.onPress();
    onActionPress();
  };

  return {
    handlePress,
    theme,
  };
}
