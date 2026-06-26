import React, { useCallback } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Image, styled, Text, useWindowDimensions, View } from "tamagui";
import EntryPallets from "@assets/svg/EntryPallets.svg";
import ExitPallets from "@assets/svg/ExitPallets.svg";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { primaryButtonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";
import { usePallet } from "../../../providers/PalletProvider";
import { useAppHeaderConfig } from "@shared/components/Navigation";

type Props = NativeStackScreenProps<RootStackParamList, "OperationSuccess">;

export function OperationSuccess({ navigation, route }: Props) {
  const { resetEntry } = usePallet();
  const { width, height } = useWindowDimensions();
  useAppHeaderConfig({visible:false});
  const operation = route.params.operation;
  const syncStatus = route.params.syncStatus;
  const isEntry = operation === "entry";
  const Illustration = isEntry ? EntryPallets : ExitPallets;

  const shortest = Math.min(width, height);
  const isTablet = shortest >= 600;
  const contentWidth = Math.min(width * 0.82, isTablet ? 460 : 330);
  const logoWidth = Math.min(contentWidth * 0.78, isTablet ? 300 : 230);
  const illustrationSize = Math.min(contentWidth * 0.86, height * 0.32, isTablet ? 320 : 250);
  const successBoxWidth = Math.min(contentWidth * 0.88, isTablet ? 360 : 285);

  const goHome = useCallback(() => {
    resetEntry();
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  }, [navigation, resetEntry]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        goHome();
        return true;
      });

      return () => subscription.remove();
    }, [goHome]),
  );

  return (
    <Screen>
      <Content width={contentWidth}>
        <Image
          source={require("@assets/svg/varlog_transparent.png")}
          width={logoWidth}
          height={logoWidth * 0.46}
          marginBottom={-8}
          resizeMode="contain"
        />

        <Illustration width={illustrationSize} height={illustrationSize} />

        <MessageBox width={successBoxWidth}>
          <MessageText>
            {isEntry ? "ENTRADA FEITA COM\nSUCESSO" : "SAÍDA FEITA COM\nSUCESSO"}
          </MessageText>
        </MessageBox>

        {syncStatus ? (
          <SyncText>
            {getSyncMessage(syncStatus)}
          </SyncText>
        ) : null}

        <HomeButton
          onPress={goHome}
        >
          <HomeButtonText>TELA INICIAL</HomeButtonText>
        </HomeButton>
      </Content>
    </Screen>
  );
}

function getSyncMessage(syncStatus: "pending" | "synced") {
  if (syncStatus === "pending") return "Movimentação salva localmente para sincronizar quando a internet voltar.";

  return "Movimentação sincronizada com o servidor.";
}

const Screen = styled(View, {
  alignItems: "center",
  backgroundColor: "$background",
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 24,
  paddingVertical: 28,
});

const Content = styled(View, {
  alignItems: "center",
  gap: 34,
  justifyContent: "center",
});

const MessageBox = styled(View, {
  alignItems: "center",
  borderColor: "$primary",
  borderWidth: 3,
  justifyContent: "center",
  minHeight: 74,
  paddingHorizontal: 16,
  paddingVertical: 14,
});

const MessageText = styled(Text, {
  ...typography.headingSmall,
  color: "$primary",
  fontWeight: "800",
  textAlign: "center",
  textTransform: "uppercase",
});

const SyncText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
  marginTop: -18,
  maxWidth: 360,
  textAlign: "center",
});

const HomeButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "$primary",
  borderColor: "$black",
  borderRadius: 2,
  borderWidth: 2,
  justifyContent: "center",
  minHeight: 40,
  minWidth: 172,
  paddingHorizontal: 18,
  paddingVertical: 8,
  pressStyle: primaryButtonPressStyle,
});

const HomeButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
  textAlign: "center",
});
