import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import { ActionLabel, ActionRow, CircleButton, FloatButtonRoot } from "./styled";
import { useFloatActionButton, useFloatButton } from "./useFloatButton";
import { useFloatActionAnimation, useFloatButtonAnimation } from "./useFloatButtonAnimation";
import { FloatButtonAction } from "./types";

type Props = {
  actions: FloatButtonAction[];
  bottom?: number;
  right?: number;
};

type ActionButtonProps = {
  action: FloatButtonAction;
  index: number;
  isOpen: boolean;
  total: number;
  onActionPress: () => void;
};

function ActionButton({ action, index, isOpen, total, onActionPress }: ActionButtonProps) {
  const { handlePress, theme } = useFloatActionButton({ action, onActionPress });
  const { animatedStyle } = useFloatActionAnimation({ index, isOpen, total });

  return (
    <Animated.View pointerEvents={isOpen ? "auto" : "none"} style={[styles.action, animatedStyle]}>
      <ActionRow>
        {action.label ? <ActionLabel numberOfLines={1}>{action.label}</ActionLabel> : null}
        <CircleButton variant="action" disabled={Boolean(action.disabled)} onPress={handlePress} hitSlop={8}>
          <action.Icon size={24} color={theme.primary} strokeWidth={2.3} />
        </CircleButton>
      </ActionRow>
    </Animated.View>
  );
}

export function FloatButton({ actions, bottom = 8, right = 20 }: Props) {
  const { close, isOpen, shouldRender, theme, toggleOpen } = useFloatButton({ actionsLength: actions.length });
  const { mainButtonStyle } = useFloatButtonAnimation(isOpen);

  if (!shouldRender) return null;

  return (
    <FloatButtonRoot pointerEvents="box-none" style={{ bottom, right }}>
      {actions.map((action, index) => (
        <ActionButton
          key={`${action.label ?? "action"}-${index}`}
          action={action}
          index={index}
          isOpen={isOpen}
          total={actions.length}
          onActionPress={close}
        />
      ))}

      <Animated.View style={mainButtonStyle}>
        <CircleButton variant="main" onPress={toggleOpen} hitSlop={8}>
          <Plus size={28} color={theme.white} strokeWidth={2.6} />
        </CircleButton>
      </Animated.View>
    </FloatButtonRoot>
  );
}

const styles = StyleSheet.create({
  action: {
    position: "absolute",
    right: 0,
  },
});
