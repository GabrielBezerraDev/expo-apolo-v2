import React, { useCallback, useEffect, useRef } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Image, styled, Text, useWindowDimensions, View } from "tamagui";
import EntryPallets from "@assets/svg/EntryPallets.svg";
import ExitPallets from "@assets/svg/ExitPallets.svg";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { typography } from "@shared/typography";
import { useRoadmapSync } from "../../../services/roadmapSync";
import { usePallet } from "../../../providers/PalletProvider";

type Props = NativeStackScreenProps<RootStackParamList, "OperationSuccess">;

export function OperationSuccess({ navigation, route }: Props) {
  const { offlineOperationId, resetEntry } = usePallet();
  const { error, state, syncOperation } = useRoadmapSync();
  const syncStartedRef = useRef(false);
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

  const goHome = useCallback(() => {
    resetEntry();
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  }, [navigation, resetEntry]);

  useEffect(() => {
    if (!offlineOperationId || syncStartedRef.current) return;

    syncStartedRef.current = true;
    void syncOperation(offlineOperationId);
  }, [offlineOperationId, syncOperation]);

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

        {state !== "idle" ? (
          <SyncText>
            {getSyncMessage(state, error)}
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

function getSyncMessage(state: string, error: string | null) {
  if (state === "syncing") return "Sincronizando com o servidor...";
  if (state === "synced") return "Movimentação sincronizada.";
  if (state === "failed") return error ?? "Movimentação salva localmente. Tentaremos sincronizar novamente.";
  if (state === "skipped") return "Movimentação salva localmente para sincronizar depois.";
  return "";
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
  pressStyle: {
    opacity: 0.84,
  },
});

const HomeButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
  textAlign: "center",
});
