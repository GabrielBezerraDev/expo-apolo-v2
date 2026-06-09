import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import LottieView from "lottie-react-native";
import ConveyorAnimation from "@assets/animations/Conveyor belt box unloading.json";
import { LoadingRoot, LoadingText, LoadingTextFrame } from "./styled";
import { useLottieAnimLoading } from "./useLottieAnimLoading";

type Props = {
  autoPlay?: boolean;
  label?: string;
  loop?: boolean;
  size?: number;
  source?: React.ComponentProps<typeof LottieView>["source"];
  style?: StyleProp<ViewStyle>;
};

export function LottieAnimLoading({
  autoPlay = true,
  label = "Carregando",
  loop = true,
  size = 180,
  source = ConveyorAnimation,
  style,
}: Props) {
  const { animationRef, dots } = useLottieAnimLoading({ autoPlay, source });

  return (
    <LoadingRoot style={style}>
      <LottieView
        ref={animationRef}
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        resizeMode="contain"
        style={{ width: size, height: size }}
      />

      <LoadingTextFrame>
        <LoadingText>{label}{dots}</LoadingText>
      </LoadingTextFrame>
    </LoadingRoot>
  );
}
