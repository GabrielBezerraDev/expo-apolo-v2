import React, { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  styled,
  Text,
  useWindowDimensions,
  View,
} from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useFrame } from "@features/camera";
import { PhotoCarousel, type PhotoCaptureOrientation } from "@shared/components/Display";
import { AppButton } from "@shared/components/Forms/AppButton";
import { typography } from "@shared/typography";
import { ListScreenShell } from "../../../components/ListScreenShell";
import { MovementCancelButton } from "../../../components/MovementCancelButton";
import { useOfflinePalletOperation } from "../../../hooks/useOfflinePalletOperation";
import { usePallet } from "../../../providers/PalletProvider";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type EvidenceKey = "truck" | "licensePlate" | "seal";

export function ExitExtraEvidence() {
  const navigation = useNavigation<Navigation>();
  const { configureScanner } = useFrame();
  const { height } = useWindowDimensions();
  const { exitExtraEvidencePhotos, offlineOperationId, resetEntry, route, shipGoodsPhotos } =
    usePallet();
  const {
    persistExitExtraEvidencePhoto,
    persistShipGoodsPhoto,
    saveExitExtraEvidenceDraft,
  } = useOfflinePalletOperation();
  const canFinishExit = Boolean(
    shipGoodsPhotos.truck &&
    exitExtraEvidencePhotos.licensePlate &&
    exitExtraEvidencePhotos.seal,
  );
  const evidenceItems = [
    {
      helper: "Carga embarcada no caminhão",
      id: "truck" as const,
      title: "Foto da carga",
      uri: shipGoodsPhotos.truck,
    },
    {
      helper: "Placa do caminhão",
      id: "licensePlate" as const,
      title: "Foto da placa",
      uri: exitExtraEvidencePhotos.licensePlate,
    },
    {
      helper: "Lacre do caminhão",
      id: "seal" as const,
      title: "Foto do lacre",
      uri: exitExtraEvidencePhotos.seal,
    },
  ];

  const scanPhoto = useCallback(
    (photoKey: EvidenceKey, captureOrientation: PhotoCaptureOrientation = "LandScape") => {
      configureScanner({
        mode: "photo",
        preset: "fullScreen",
        orientation: captureOrientation,
        onCapture: async (data) => {
          if (photoKey === "truck") {
            await persistShipGoodsPhoto(data.imageUri);
          } else {
            await persistExitExtraEvidencePhoto(photoKey, data.imageUri);
          }
          navigation.goBack();
        },
        onCancel: () => navigation.goBack(),
      });
      navigation.navigate("Scanner");
    },
    [
      configureScanner,
      navigation,
      persistExitExtraEvidencePhoto,
      persistShipGoodsPhoto,
    ],
  );

  const cancelMovement = () => {
    const hasEvidenceData = Boolean(
      shipGoodsPhotos.truck ||
      exitExtraEvidencePhotos.licensePlate ||
      exitExtraEvidencePhotos.seal,
    );

    if (!route.trim() && !hasEvidenceData && !offlineOperationId) {
      resetEntry();
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
      return;
    }

    Alert.alert(
      "Cancelar saída",
      "Esta movimentação será salva como rascunho. Você poderá continuar depois. Deseja sair agora?",
      [
        { text: "Continuar preenchendo", style: "cancel" },
        {
          text: "Salvar rascunho e sair",
          style: "destructive",
          onPress: async () => {
            await saveExitExtraEvidenceDraft({ currentStep: "exit_extra_evidence" });
            resetEntry();
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
          },
        },
      ],
    );
  };

  const finishExit = async () => {
    await saveExitExtraEvidenceDraft({
      currentStep: "completed",
      status: "pending_sync",
    });
    navigation.navigate("OperationSuccess", { operation: "exit" });
  };

  return (
    <ListScreenShell
      title="Evidências finais"
      topRightAction={<MovementCancelButton onPress={cancelMovement} />}
    >
      <Header>
        <View>
          <Title>Roteiro: {route}</Title>
          <HelperText>
            Tire as fotos da carga, placa e lacre do caminhão.
          </HelperText>
        </View>
      </Header>
      <View flex={1} justifyContent="center" alignItems="center" marginBottom={60}>
        <PhotoCarousel
          captureOrientation="Portrait"
          emptyLabel="TOQUE PARA FOTOGRAFAR"
          heightPreset="medium"
          items={evidenceItems.map((item, index) => ({
            id: item.id,
            subtitle: `${item.helper} (${index + 1}/3)`,
            title: item.title,
            uri: item.uri,
          }))}
          onPressItem={(item, _, captureOrientation) => scanPhoto(item.id as EvidenceKey, captureOrientation)}
          showItemHeader
        />
      </View>
      <AppButton
        style={{ width: "100%", height: height * 0.06, marginBottom: height * 0.02 }}
        title="FINALIZAR SAÍDA"
        disabled={!canFinishExit}
        onPress={finishExit}
      />
    </ListScreenShell>
  );
}

const Header = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
});

const Title = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
});

const HelperText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
});
