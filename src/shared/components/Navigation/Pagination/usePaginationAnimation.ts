import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export function usePaginationAnimation() {
  const paginationTranslateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(paginationTranslateY, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [paginationTranslateY]);

  return {
    paginationStyle: { transform: [{ translateY: paginationTranslateY }] },
  };
}
