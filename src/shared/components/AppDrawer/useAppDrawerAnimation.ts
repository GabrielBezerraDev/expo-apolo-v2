import { useEffect } from "react";
import { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export function useAppDrawerAnimation(visible: boolean) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: 240 });
    }
  }, [progress, visible]);

  const closeWithAnimation = (callback: () => void) => {
    progress.value = withTiming(0, { duration: 180 }, finished => {
      if (finished) runOnJS(callback)();
    });
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 320 * (1 - progress.value) }],
  }));

  return {
    backdropStyle,
    closeWithAnimation,
    panelStyle,
  };
}
