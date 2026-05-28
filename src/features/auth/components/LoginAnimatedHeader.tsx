import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { typography } from "@shared/typography";
import { useThemeMode } from "@hooks/useThemeMode";
import EmployeeSvg from "@assets/svg/employee.svg";
import MessengerSvg from "@assets/svg/Messenger-cuate.svg";

const { width } = Dimensions.get("window");
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
    <View style={styles.shinyTextBox}>
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <View style={styles.shinyMaskContainer}>
            <Text style={[styles.powered, styles.shinyMaskText]}>Conecthus</Text>
          </View>
        }
      >
        <LinearGradient
          colors={["#00ff59", "#29b65d", "#0bec5a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <AnimatedLinearGradient
          colors={["transparent", "#8dffad", "#18d85a", "transparent"]}
          locations={[0, 0.45, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.shineStripe, { transform: [{ translateX }] }]}
        />
      </MaskedView>
    </View>
  );
}



export function LoginAnimatedHeader() {
  const { theme } = useThemeMode();
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
        toValue: -20,
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
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.logo,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslate }],
          },
        ]}
      >
        <Image
          source={require("@assets/svg/varlog_transparent.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.employee,
          {
            opacity: employeeOpacity,
            transform: [{ translateX: employeeTranslate }, { translateY: -25 }],
          },
        ]}
      >
        <EmployeeSvg width={width * 0.44} height={250} />
      </Animated.View>

      <Animated.View
        style={[
          styles.messenger,
          {
            opacity: messengerOpacity,
            transform: [
              { translateX: messengerTranslate },
              { scaleX: -1 },
              { translateY: -40 },
            ],
          },
        ]}
      >
        <MessengerSvg width={width * 0.49} height={252} />
      </Animated.View>

      <View style={styles.titleBlock} pointerEvents="none">
        <View style={styles.titleRow}>
          <View style={styles.apoStrokeWrapper}>
            <Text
              style={[styles.title, styles.apoStroke, { color: theme.primary }]}
            >
              Apo
            </Text>
            <Text style={[styles.title, styles.titleDark]}>Apo</Text>
          </View>
          <Text
            style={[styles.title, styles.titleOrange, { color: theme.primary }]}
          >
            llo
          </Text>
        </View>
        <View style={styles.apoStrokeWrapper}>
          <Text
            style={[
              styles.subtitle,
              styles.apoStroke,
              {
                color: theme.black,
                left: -0.4,
                top: -0.4,
                transform: [{ scale: 1.02 }],
              },
            ]}
          >
            Controle de material
          </Text>
          <Text style={[styles.subtitle, { color: theme.primary }]}> 
            Controle de material
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 330,
    marginTop: 2,
    marginBottom: 20  
  },
  logo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3,
  },
  logoImage: {
    width: 218,
    height: 138,
    position:'absolute',
  },
  employee: {
    position: "absolute",
    left: 8,
    top: 132,
    zIndex: 1,
  },
  messenger: {
    position: "absolute",
    right: 6,
    top: 126,
    zIndex: 1,
  },
  titleBlock: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 132,
    alignItems: "center",
    zIndex: 2,
  },
  title: {
    fontSize: 54,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  apoStrokeWrapper: {
    position: "relative",
  },
  apoStroke: {
    position: "absolute",
    left: -1.2,
    top: -1.2,
    textShadowColor: "#ff6200",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
    transform: [{ scale: 1.04 }],
  },
  titleDark: {
    color: "#111111",
  },
  titleOrange: {
    fontWeight: "900",
  },
  subtitle: {
    ...typography.headingSmall,
    marginTop: -2,
    fontStyle: "italic",
  },
  powered: {
    ...typography.bodySmall,
    marginTop: 4,
    fontWeight: "bold",
  },
  poweredRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(246, 243, 247, 0.82)",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 6,
  },
  shinyTextBox: {
    width: 72,
    height: 20,
    marginTop: 4,
    overflow: "hidden",
  },
  shinyMaskContainer: {
    flex: 1,
    justifyContent: "center",
  },
  shinyMaskText: {
    marginTop: 0,
    color: "#000000",
    ...typography.bodyMedium
  },
  shineStripe: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 42,
  },
});
