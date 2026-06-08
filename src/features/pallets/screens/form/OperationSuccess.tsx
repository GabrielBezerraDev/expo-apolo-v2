import React from "react";
import { Image, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "tamagui";
import EntryPallets from "@assets/svg/EntryPallets.svg";
import ExitPallets from "@assets/svg/ExitPallets.svg";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useThemeMode } from "@shared/components/ThemeToggle";
import { typography } from "@shared/typography";
import { usePallet } from "../../providers/PalletProvider";

type Props = NativeStackScreenProps<RootStackParamList, "OperationSuccess">;

export function OperationSuccess({ navigation, route }: Props) {
  const { theme } = useThemeMode();
  const { resetEntry } = usePallet();
  const { width, height } = useWindowDimensions();
  const operation = route.params.operation;
  const isEntry = operation === "entry";
  const Illustration = isEntry ? EntryPallets : ExitPallets;

  const shortest = Math.min(width, height);
  const isTablet = shortest >= 600;
  const contentWidth = Math.min(width * 0.82, isTablet ? 460 : 330);
  const logoWidth = Math.min(contentWidth * 0.78, isTablet ? 300 : 230);
  const illustrationSize = Math.min(contentWidth * 0.86, height * 0.32, isTablet ? 320 : 250);
  const successBoxWidth = Math.min(contentWidth * 0.88, isTablet ? 360 : 285);

  const goHome = () => {
    resetEntry();
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}> 
      <View style={[styles.content, { width: contentWidth }]}> 
        <Image
          source={require("@assets/svg/varlog_transparent.png")}
          style={[styles.logo, { width: logoWidth, height: logoWidth * 0.46 }]}
          resizeMode="contain"
        />

        <Illustration width={illustrationSize} height={illustrationSize} />

        <View
          style={[
            styles.messageBox,
            {
              borderColor: theme.primary,
              width: successBoxWidth,
            },
          ]}
        >
          <Text style={[styles.messageText, { color: theme.primary }]}> 
            {isEntry ? "ENTRADA FEITA COM\nSUCESSO" : "SAÍDA FEITA COM\nSUCESSO"}
          </Text>
        </View>

        <Pressable
          onPress={goHome}
          style={({ pressed }) => [
            styles.homeButton,
            {
              backgroundColor: theme.primary,
              borderColor: theme.black,
              opacity: pressed ? 0.84 : 1,
            },
          ]}
        >
          <Text style={[styles.homeButtonText, { color: theme.white }]}>TELA INICIAL</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    gap: 34,
  },
  logo: {
    marginBottom: -8,
  },
  messageBox: {
    alignItems: "center",
    borderWidth: 3,
    justifyContent: "center",
    minHeight: 74,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  messageText: {
    ...typography.headingSmall,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
  },
  homeButton: {
    alignItems: "center",
    borderRadius: 2,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 172,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  homeButtonText: {
    ...typography.button,
    fontWeight: "900",
    textAlign: "center",
  },
});
