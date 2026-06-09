import { useEffect, useRef, useState } from "react";
import LottieView from "lottie-react-native";

type UseLottieAnimLoadingParams = {
  autoPlay: boolean;
  source: React.ComponentProps<typeof LottieView>["source"];
};

export function useLottieAnimLoading({ autoPlay, source }: UseLottieAnimLoadingParams) {
  const animationRef = useRef<LottieView>(null);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!autoPlay) return;

    animationRef.current?.reset();
    animationRef.current?.play();
  }, [autoPlay, source]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(current => (current.length >= 3 ? "" : `${current}.`));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return { animationRef, dots };
}
