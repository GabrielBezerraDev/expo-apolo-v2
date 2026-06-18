import React, { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera } from "lucide-react-native";
import { Button, ScrollView, styled, Text, useWindowDimensions, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useFrame } from "@features/camera";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { useModal } from "@shared/components/Display/Modal";
import { PhotoCarousel, type PhotoCaptureOrientation } from "@shared/components/Display";
import { AppButton } from "@shared/components/Forms/AppButton";
import { AppInput } from "@shared/components/Forms/AppInput";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import { fontScale, typography } from "@shared/typography";
import { useOfflinePalletOperation } from "../../hooks/useOfflinePalletOperation";
import { usePallet } from "../../providers/PalletProvider";
import { type RoadmapApi, useRoadmapApi } from "../../services/roadmapApi";
import { ListScreenShell } from "../../components/ListScreenShell";
import { MovementCancelButton } from "../../components/MovementCancelButton";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function PalletsEvidence() {
  const navigation = useNavigation<Navigation>();
  const { configureScanner } = useFrame();
  const { closeModal, openModal } = useModal();
  const roadmapApi = useRoadmapApi();
  const { theme } = useThemeMode();
  const { width, height } = useWindowDimensions();
  const {
    operationPallet,
    offlineOperationId,
    palletEvidence,
    resetEntry,
    route,
    setPalletEvidence,
  } = usePallet();
  const { persistPalletPhoto, savePalletEvidenceDraft } = useOfflinePalletOperation();
  const cardWidth = width - width * 0.1;

  const openPalletValidationModal = useCallback((message: string) => {
    let modalId = "";

    modalId = openModal(
      <PalletScanWarningModal
        message={message}
        onClose={() => closeModal(modalId)}
      />,
      {
        animationType: "slide",
        heightPercent: 34,
        maxHeightPercent: 54,
        minHeight: 0,
        title: "Palete não autorizado",
        widthPercent: 88,
      },
    );
  }, [closeModal, openModal]);

  const validateForm =
    palletEvidence.length > 0 &&
    palletEvidence.every(
      (pallet) => Boolean(pallet.batch) && pallet.photos.every(Boolean),
    );

  const scanLot = useCallback(
    (palletIndex: number) => {
      configureScanner({
        mode: "scanner",
        preset: "tinyDataLandScape",
        orientation: "LandScape",
        onCapture: async (data) => {
          const scannedBatch = data.text.trim();
          navigation.goBack();

          try {
            await validateScannedBatch({
              batch: scannedBatch,
              operationPallet,
              roadmapApi,
            });
          } catch (error) {
            const nextEvidence = palletEvidence.map((pallet, index) => {
              if (index !== palletIndex) return pallet;

              return {
                ...pallet,
                batch: "",
              };
            });

            setPalletEvidence(nextEvidence);
            await savePalletEvidenceDraft({ evidence: nextEvidence });
            requestAnimationFrame(() => {
              openPalletValidationModal(getPalletValidationErrorMessage(error));
            });
            return;
          }

          const nextEvidence = palletEvidence.map((pallet, index) => {
            if (index !== palletIndex) return pallet;

            return {
              ...pallet,
              batch: scannedBatch,
            };
          });
          setPalletEvidence(nextEvidence);
          await savePalletEvidenceDraft({ evidence: nextEvidence });
        },
        onCancel: () => navigation.goBack(),
        formatTextDataWithRegex: (data) => data.replace(/\D/g, ""),
      });
      navigation.navigate("Scanner");
    },
    [configureScanner, navigation, openPalletValidationModal, operationPallet, palletEvidence, roadmapApi, savePalletEvidenceDraft, setPalletEvidence],
  );

  const scanPhoto = useCallback(
    (palletIndex: number, photoIndex: number, captureOrientation: PhotoCaptureOrientation = "LandScape") => {
      configureScanner({
        mode: "photo",
        preset: "fullScreen",
        orientation: captureOrientation,
        onCapture: async (data) => {
          await persistPalletPhoto({ palletIndex, photoIndex, sourceUri: data.imageUri });
          navigation.goBack();
        },
        onCancel: () => navigation.goBack(),
      });
      navigation.navigate("Scanner");
    },
    [configureScanner, navigation, persistPalletPhoto],
  );

  const cancelMovement = () => {
    const hasEvidenceData = palletEvidence.some(
      (pallet) => pallet.batch.trim() || pallet.photos.some(Boolean),
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
      `Cancelar ${operationPallet === "entry" ? "entrada" : "saída"}`,
      "Esta movimentação será salva como rascunho. Você poderá continuar depois. Deseja sair agora?",
      [
        { text: "Continuar preenchendo", style: "cancel" },
        {
          text: "Salvar rascunho e sair",
          style: "destructive",
          onPress: async () => {
            await savePalletEvidenceDraft({ currentStep: "pallets_evidence" });
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

  const finishEntry = async () => {
    if (operationPallet === "exit") {
      await savePalletEvidenceDraft({ currentStep: "exit_extra_evidence" });
      navigation.navigate("ExitExtraEvidence");
      return;
    }

    await savePalletEvidenceDraft({ currentStep: "completed", status: "pending_sync" });
    navigation.navigate("OperationSuccess", { operation: "entry" });
  };

  return (
    <ListScreenShell
      title="Captura de paletes"
      topRightAction={<MovementCancelButton onPress={cancelMovement} />}
    >
      <ScrollView
        contentContainerStyle={palletsContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <PalletsHeader>
          <View>
            <PalletsTitle>
              Roteiro: {route}
            </PalletsTitle>
            <HelperText>
              Preencha lote e 4 fotos de cada palete.
            </HelperText>
          </View>
        </PalletsHeader>

        {palletEvidence.map((pallet, palletIndex) => (
          <PalletCard
            key={palletIndex}
            width={cardWidth}
          >
            <PalletCardHeader>
              <PalletCardTitle>
                Palete {palletIndex + 1}/{palletEvidence.length}
              </PalletCardTitle>
            </PalletCardHeader>
            <PhotoCarousel
              captureOrientation="Portrait"
              emptyLabel="TOQUE PARA FOTOGRAFAR"
              heightPreset="medium"
              items={pallet.photos.map((photo, photoIndex) => ({
                id: `palete-${palletIndex}-foto-${photoIndex}`,
                uri: photo,
              }))}
              onPressItem={(_, photoIndex, captureOrientation) => scanPhoto(palletIndex, photoIndex, captureOrientation)}
            />
            <AppInput
              label="Escanear lote"
              value={pallet.batch}
              editable={false}
              placeholder="Escaneie o lote"
              rightIcon={
                <IconButton onPress={() => scanLot(palletIndex)} hitSlop={10}>
                  <Camera size={20 * fontScale} color={theme.primary} />
                </IconButton>
              }
            />
          </PalletCard>
        ))}

        <AppButton
          style={{ width: "100%", height: height * 0.06 }}
          title={operationPallet === "exit" ? "CONTINUAR" : "CONFIRMAR"}
          disabled={!validateForm}
          onPress={finishEntry}
        />
      </ScrollView>
    </ListScreenShell>
  );
}

function PalletScanWarningModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <WarningModalRoot>
      <WarningModalText>{message}</WarningModalText>
      <WarningModalButton onPress={onClose}>
        <WarningModalButtonText>ENTENDI</WarningModalButtonText>
      </WarningModalButton>
    </WarningModalRoot>
  );
}

async function validateScannedBatch({
  batch,
  operationPallet,
  roadmapApi,
}: {
  batch: string;
  operationPallet: "entry" | "exit";
  roadmapApi: RoadmapApi;
}) {
  if (!batch) {
    throw new Error("Lote do palete é obrigatório.");
  }

  if (!hasApiBaseUrl() || !roadmapApi.hasAuthToken) {
    throw new Error("Não foi possível validar o palete. Verifique sua conexão e tente novamente.");
  }

  await roadmapApi.validatePallet({
    batch,
    typeRoadmap: operationPallet === "entry" ? "ENTRY" : "EXIT",
  });
}

function getPalletValidationErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Não foi possível validar o palete. Tente novamente.";
}

const palletsContentStyle = {
  alignItems: "center" as const,
  gap: 16,
  paddingBottom: 36,
  paddingVertical: 18,
};

const HelperText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "800",
});

const PalletsHeader = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
});

const PalletsTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
});

const PalletCard = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  gap: 14,
  padding: 16,
});

const PalletCardHeader = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
});

const PalletCardTitle = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "800",
});

const IconButton = styled(Button, {
  unstyled: true,
});

const WarningModalRoot = styled(View, {
  gap: 18,
  justifyContent: "center",
});

const WarningModalText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "700",
  textAlign: "center",
});

const WarningModalButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "$primary",
  borderRadius: 12,
  justifyContent: "center",
  minHeight: 46,
  paddingHorizontal: 18,
  paddingVertical: 12,
});

const WarningModalButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
});
