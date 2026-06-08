import { useCallback } from "react";
import { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { ModalAnimation, ModalPlacement } from "./modal.type";

type UseModalAnimationParams = {
  animationType: ModalAnimation;
  placement: ModalPlacement;
};

export function useModalAnimation({ animationType, placement }: UseModalAnimationParams) {
  const progress = useSharedValue(0);

  const animateTo = useCallback(
    (toValue: number, callback?: () => void) => {
      if (animationType === "none") {
        progress.value = toValue;
        callback?.();
        return;
      }

      progress.value = withTiming(toValue, { duration: toValue === 1 ? 220 : 170 }, finished => {
        if (finished && callback) runOnJS(callback)();
      });
    },
    [animationType, progress],
  );

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => {
    if (animationType === "slide") {
      const initialOffset = placement === "bottom" ? 48 : -48;

      return {
        opacity: progress.value,
        transform: [
          {
            translateY: initialOffset * (1 - progress.value),
          },
        ],
      };
    }

    return {
      opacity: progress.value,
      transform: [
        {
          scale: animationType === "none" ? 1 : 0.96 + progress.value * 0.04,
        },
      ],
    };
  });

  return {
    animateTo,
    backdropAnimatedStyle,
    contentAnimatedStyle,
  };
}
