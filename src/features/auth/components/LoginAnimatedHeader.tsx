import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Image, styled, Text, useWindowDimensions, View } from "tamagui";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { isTablet, typography } from "@shared/typography";
import EmployeeSvg from "@assets/svg/employee.svg";
import MessengerSvg from "@assets/svg/Messenger-cuate.svg";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function ShinyConecthus() {
  const shineTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shineTranslate, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.delay(100),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [shineTranslate]);

  const translateX = shineTranslate.interpolate({
    inputRange: [0, 1],
    outputRange: [-82, 82],
  });

  return (
    <ShinyTextBox>
      <MaskedView
        style={absoluteFillStyle}
        maskElement={
          <ShinyMaskContainer>
            <ShinyMaskText>Conecthus</ShinyMaskText>
          </ShinyMaskContainer>
        }
      >
        <LinearGradient
          colors={["#00ff59", "#29b65d", "#0bec5a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={absoluteFillStyle}
        />
        <AnimatedLinearGradient
          colors={["transparent", "#8dffad", "#18d85a", "transparent"]}
          locations={[0, 0.45, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[shineStripeStyle, { transform: [{ translateX }] }]}
        />
      </MaskedView>
    </ShinyTextBox>
  );
}



export function LoginAnimatedHeader() {
  const { width, height } = useWindowDimensions();
  const employeeOpacity = useRef(new Animated.Value(0)).current;
  const employeeTranslate = useRef(new Animated.Value(-width * 0.55)).current;
  const messengerOpacity = useRef(new Animated.Value(0)).current;
  const messengerTranslate = useRef(new Animated.Value(width * 0.55)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslate = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoTranslate, {
        toValue: -40,
        damping: 12,
        stiffness: 75,
        mass: 0.7,
        useNativeDriver: true,
        delay: 2000,
      }),
      Animated.timing(employeeOpacity, {
        toValue: 1,
        duration: 700,
        delay: 120,
        useNativeDriver: true,
      }),
      Animated.timing(employeeTranslate, {
        toValue: -50,
        duration: 700,
        delay: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(messengerOpacity, {
        toValue: 1,
        duration: 700,
        delay: 780,
        useNativeDriver: true,
      }),
      Animated.timing(messengerTranslate, {
        toValue: 40,
        duration: 700,
        delay: 1400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    employeeOpacity,
    employeeTranslate,
    logoOpacity,
    logoTranslate,
    messengerOpacity,
    messengerTranslate,
  ]);

  return (
    <Root>
      <AnimatedView
        style={[
          logoStyle,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslate }],
          },
        ]}
      >
        <LogoImage
          source={require("@assets/svg/varlog_transparent.png")}
          resizeMode="contain"
        />
      </AnimatedView>

      <AnimatedView
        style={[
          employeeStyle,
          {
            opacity: employeeOpacity,
            transform: [{ translateX: employeeTranslate }, { translateY: isTablet ? -235 : -163 }],
          },
        ]}
      >
        <EmployeeSvg width={width * 0.50} height={height * 0.50} />
      </AnimatedView>

      <AnimatedView
        style={[
          messengerStyle,
          {
            opacity: messengerOpacity,
            transform: [
              { translateX: messengerTranslate },
              { scaleX: -1 },
              { translateY: isTablet ? -220 : -150  },
            ],
          },
        ]}
      >
        <MessengerSvg width={width * 0.45} height={height * 0.45} />
      </AnimatedView>

      <TitleBlock pointerEvents="none">
        <TitleRow>
          <ApoStrokeWrapper>
            <ApoStrokeTitle>
              Apo
            </ApoStrokeTitle>
            <TitleDark>Apo</TitleDark>
          </ApoStrokeWrapper>
          <TitleOrange>
            llo
          </TitleOrange>
        </TitleRow>
        <ApoStrokeWrapper>
          <SubtitleStroke>
            Controle de material
          </SubtitleStroke>
          <SubtitleText>
            Controle de material
          </SubtitleText>
        </ApoStrokeWrapper>
      </TitleBlock>
    </Root>
  );
}

const absoluteFillStyle = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const shineStripeStyle = {
  position: "absolute" as const,
  top: 0,
  bottom: 0,
  width: 42,
};

const logoStyle = {
  alignItems: "center" as const,
  left: 0,
  position: "absolute" as const,
  right: 0,
  top: 0,
  zIndex: 3,
};

const employeeStyle = {
  left: 8,
  position: "absolute" as const,
  top: 132,
  zIndex: 1,
};

const messengerStyle = {
  position: "absolute" as const,
  right: 6,
  top: 126,
  zIndex: 1,
};

const Root = styled(View, {
  height: 330,
  marginBottom: 20,
  marginTop: 2,
});

const LogoImage = styled(Image, {
  height: 138,
  position: "absolute",
  width: 218,
});

const TitleBlock = styled(View, {
  alignItems: "center",
  left: 0,
  position: "absolute",
  right: 0,
  top: 132,
  zIndex: 2,
});

const TitleRow = styled(View, {
  alignItems: "center",
  flexDirection: "row",
});

const ApoStrokeWrapper = styled(View, {
  position: "relative",
});

const TitleBase = styled(Text, {
  fontSize: 54,
  fontStyle: "italic",
  fontWeight: "900",
  letterSpacing: -2,
});

const ApoStrokeTitle = styled(TitleBase, {
  color: "$primary",
  left: -1.2,
  position: "absolute",
  textShadowColor: "$primary",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 2,
  top: -1.2,
  transform: [{ scale: 1.04 }],
});

const TitleDark = styled(TitleBase, {
  color: "$black",
});

const TitleOrange = styled(TitleBase, {
  color: "$primary",
});

const SubtitleBase = styled(Text, {
  ...typography.headingSmall,
  fontStyle: "italic",
  marginTop: -2,
});

const SubtitleStroke = styled(SubtitleBase, {
  color: "$black",
  left: -0.4,
  position: "absolute",
  textShadowColor: "$primary",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 2,
  top: -0.4,
  transform: [{ scale: 1.02 }],
});

const SubtitleText = styled(SubtitleBase, {
  color: "$primary",
});

const ShinyTextBox = styled(View, {
  height: 20,
  marginTop: 4,
  overflow: "hidden",
  width: 72,
});

const ShinyMaskContainer = styled(View, {
  flex: 1,
  justifyContent: "center",
});

const ShinyMaskText = styled(Text, {
  ...typography.bodyMedium,
  color: "$black",
  fontWeight: "bold",
});
