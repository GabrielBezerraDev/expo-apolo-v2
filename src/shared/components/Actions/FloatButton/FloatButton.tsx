import React from "react";
import Animated from "react-native-reanimated";
import { View } from "tamagui";
import { Plus } from "lucide-react-native";
import { ActionLabel, ActionRow, CircleButton, FloatButtonRoot } from "./styled";
import { useFloatActionButton, useFloatButton } from "./useFloatButton";
import { useFloatActionAnimation, useFloatButtonAnimation } from "./useFloatButtonAnimation";
import { FloatButtonAction } from "./types";

const AnimatedView = Animated.createAnimatedComponent(View);

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
    <AnimatedView pointerEvents={isOpen ? "auto" : "none"} style={[actionStyle, animatedStyle]}>
      <ActionRow>
        {action.label ? <ActionLabel numberOfLines={1}>{action.label}</ActionLabel> : null}
        <CircleButton variant="action" disabled={Boolean(action.disabled)} onPress={handlePress} hitSlop={8}>
          <action.Icon size={24} color={theme.primary} strokeWidth={2.3} />
        </CircleButton>
      </ActionRow>
    </AnimatedView>
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

      <AnimatedView style={mainButtonStyle}>
        <CircleButton variant="main" onPress={toggleOpen} hitSlop={8}>
          <Plus size={28} color={theme.white} strokeWidth={2.6} />
        </CircleButton>
      </AnimatedView>
    </FloatButtonRoot>
  );
}

const actionStyle = {
  position: "absolute" as const,
  right: 0,
};
