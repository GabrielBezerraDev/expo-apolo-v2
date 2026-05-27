import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { Plus } from "lucide-react-native";
import { useThemeMode } from "@hooks/useThemeMode";
import { ActionLabel, ActionRow, CircleButton, FloatButtonRoot } from "./styled";

export type FloatButtonAction = {
  Icon: React.ComponentType<any>;
  label?: string;
  onPress: () => void;
  disabled?: boolean;
};

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

const BUTTON_SPACING = 68;

function ActionButton({ action, index, isOpen, total, onActionPress }: ActionButtonProps) {
  const { theme } = useThemeMode();
  const progress = useSharedValue(0);

  useEffect(() => {
    const openingDelay = index * 35;
    const closingDelay = (total - index - 1) * 25;

    progress.value = withDelay(
      isOpen ? openingDelay : closingDelay,
      withSpring(isOpen ? 1 : 0, { damping: 104, stiffness: 1500 })
    );
  }, [index, isOpen, progress, total]);

  const animatedStyle = useAnimatedStyle(() => ({
    bottom: BUTTON_SPACING * (index + 1) * progress.value,
    opacity: progress.value,
    transform: [{ scale: 0.65 + progress.value * 0.35 }],
  }));

  const handlePress = () => {
    if (action.disabled) return;

    action.onPress();
    onActionPress();
  };

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
  const { theme } = useThemeMode();
  const [isOpen, setIsOpen] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(isOpen ? 1 : 0, { damping: 12, stiffness: 120 });
  }, [isOpen, rotation]);

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 45}deg` }],
  }));

  if (actions.length === 0) return null;

  return (
    <FloatButtonRoot pointerEvents="box-none" style={{ bottom, right }}>
      {actions.map((action, index) => (
        <ActionButton
          key={`${action.label ?? "action"}-${index}`}
          action={action}
          index={index}
          isOpen={isOpen}
          total={actions.length}
          onActionPress={() => setIsOpen(false)}
        />
      ))}

      <Animated.View style={mainButtonStyle}>
        <CircleButton variant="main" onPress={() => setIsOpen(current => !current)} hitSlop={8}>
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
