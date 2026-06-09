import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated";

const BUTTON_SPACING = 68;

type UseFloatActionAnimationParams = {
  index: number;
  isOpen: boolean;
  total: number;
};

export function useFloatButtonAnimation(isOpen: boolean) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withSpring(isOpen ? 1 : 0, { damping: 12, stiffness: 120 });
  }, [isOpen, rotation]);

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 45}deg` }],
  }));

  return { mainButtonStyle };
}

export function useFloatActionAnimation({ index, isOpen, total }: UseFloatActionAnimationParams) {
  const progress = useSharedValue(0);

  useEffect(() => {
    const openingDelay = index * 35;
    const closingDelay = (total - index - 1) * 25;

    progress.value = withDelay(
      isOpen ? openingDelay : closingDelay,
      withSpring(isOpen ? 1 : 0, { damping: 104, stiffness: 1500 }),
    );
  }, [index, isOpen, progress, total]);

  const animatedStyle = useAnimatedStyle(() => ({
    bottom: BUTTON_SPACING * (index + 1) * progress.value,
    opacity: progress.value,
    transform: [{ scale: 0.65 + progress.value * 0.35 }],
  }));

  return { animatedStyle };
}
