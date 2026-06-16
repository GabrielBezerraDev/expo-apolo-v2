import React, { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera } from "lucide-react-native";
import { Button, styled, Text, useWindowDimensions, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useFrame } from "@features/camera";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { useModal } from "@shared/components/Display/Modal";
import { AppButton } from "@shared/components/Forms/AppButton";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import { AppInput } from "@shared/components/Forms/AppInput";
import { fontScale, typography } from "@shared/typography";
import { useOfflinePalletOperation } from "../../../hooks/useOfflinePalletOperation";
import { getOfflinePalletOperationByRoadmap } from "../../../services/offlinePalletOperations";
import { useRoadmapApi } from "../../../services/roadmapApi";
import { usePallet } from "../../../providers/PalletProvider";
import { ListScreenShell } from "../../../components/ListScreenShell";
import { MovementCancelButton } from "../../../components/MovementCancelButton";
import { FormScreenPalletType } from './FormScreenPalletType';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function FormScreenPallet() {
  const navigation = useNavigation<Navigation>();
  const { configureScanner } = useFrame();
  const { closeModal, openModal } = useModal();
  const roadmapApi = useRoadmapApi();
  const { theme } = useThemeMode();
  const {
    route,
    palletQuantity,
    setPalletQuantity,
    startPalletCapture,
    resetEntry,
    controlFormScreenPallet,
    getValeusScreenPallet,
    isValidFormScreenPalletValue,
    offlineOperationId,
    operationPallet,
    setFormScreenPalletValue,
  } = usePallet();
  const { saveFormDraft } = useOfflinePalletOperation();



  const navigator = useNavigation();
  const { height } = useWindowDimensions();
  const operationLabel = operationPallet === "exit" ? "saída" : "entrada";
  const clearScannedRoadmap = useCallback(() => {
    setFormScreenPalletValue("roadmap", "", { shouldValidate: true });
  }, [setFormScreenPalletValue]);

  const openRoadmapExistsModal = useCallback((scannedRoadmap: string) => {
    let modalId = "";

    modalId = openModal(
      <RoadmapScanWarningModal
        roadmap={scannedRoadmap}
        onClose={() => closeModal(modalId)}
      />,
      {
        animationType: "slide",
        heightPercent: 34,
        maxHeightPercent: 54,
        minHeight: 0,
        title: "Roteiro já existe",
        widthPercent: 88,
      },
    );
  }, [closeModal, openModal]);

  const scanRoadmap = useCallback(() => {
    configureScanner({
      mode: "scanner",
      preset: "tinyDataLandScape",
      orientation: "LandScape",
      onCapture: async (data) => {
        const scannedRoadmap = data.text.trim();
        const canValidateRoadmap = hasApiBaseUrl() && roadmapApi.hasAuthToken;
        const roadmapExists = canValidateRoadmap
          ? await roadmapApi.roadmapExists(scannedRoadmap).catch(() => false)
          : false;

        if (roadmapExists) {
          clearScannedRoadmap();
          navigation.goBack();
          openRoadmapExistsModal(scannedRoadmap);
          return;
        }

        setFormScreenPalletValue("roadmap", scannedRoadmap, {
          shouldValidate: true,
        });
        await saveFormDraft({ roadmap: scannedRoadmap });
        navigation.goBack();
      },
      onCancel: () => navigator.goBack(),
      formatTextDataWithRegex: (data) => data.replace(/[^a-zA-Z0-9\s]/g, ""),
    });
    navigation.navigate('Scanner');
  }, [clearScannedRoadmap, configureScanner, navigation, navigator, openRoadmapExistsModal, roadmapApi, saveFormDraft, setFormScreenPalletValue]);

  const formSubtitle = useMemo(() => {
    if (!route) return "Escaneie o roteiro e informe a quantidade de paletes.";
    return `Roteiro ${route}`;
  }, [route]);

  const confirm = async () => {
    const currentRoadmap = getValeusScreenPallet("roadmap").trim();
    const existingOperation = await getOfflinePalletOperationByRoadmap(currentRoadmap);

    if (existingOperation && existingOperation.currentStep !== "form") {
      navigation.navigate("PalletOperationSummary", { operationId: existingOperation.id });
      return;
    }

    if (!startPalletCapture()) return;
    await saveFormDraft({ currentStep: "pallets_evidence" });
    navigation.navigate("PalletsEvidence");
  };

  const handleQuantityChange = (value: string) => {
    const nextValue = value.replace(/[^0-9]/g, "");
    setPalletQuantity(nextValue);
    void saveFormDraft({ palletsQuantity: nextValue });
  };

  const cancelMovement = () => {
    const currentRoadmap = getValeusScreenPallet("roadmap").trim();

    if (!currentRoadmap && !offlineOperationId) {
      resetEntry();
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
      return;
    }

    Alert.alert(
      `Cancelar ${operationLabel}`,
      "Esta movimentação será salva como rascunho. Você poderá continuar depois. Deseja sair agora?",
      [
        { text: "Continuar preenchendo", style: "cancel" },
        {
          text: "Salvar rascunho e sair",
          style: "destructive",
          onPress: async () => {
            await saveFormDraft({ currentStep: "form" });
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

  return (
    <ListScreenShell
      title={`Nova ${operationLabel}`}
      topRightAction={<MovementCancelButton onPress={cancelMovement} />}
    >
      <FormScreenRoot>
        <Panel>
          <PanelHeader>
            <PanelHeaderText>{`NOVA ${operationLabel.toUpperCase()}`}</PanelHeaderText>
          </PanelHeader>
          <FormBody>
            <HelperText>
              {formSubtitle}
            </HelperText>
            <AppInput<FormScreenPalletType>
              controllerReactFormsProps={{
                name: "roadmap",
                control: controlFormScreenPallet,
                
              }}
              label="Roteiro"
              value={route}
              editable={false}
              placeholder="Escaneie o roteiro"
              rightIcon={
                <IconButton onPress={scanRoadmap} hitSlop={10}>
                  <Camera size={20 * fontScale} color={theme.primary} />
                </IconButton>
              }
            />
            <AppInput<FormScreenPalletType>
              controllerReactFormsProps={{
                name: "palletsQuantity",
                control: controlFormScreenPallet,
              }}
              label="Quan. de paletes"
              value={palletQuantity}
              onChangeText={handleQuantityChange}
              keyboardType="number-pad"
              placeholder="Ex: 2"
            />
            <AppButton
              style={{width:'100%', height: height * 0.06}}
              title="CONFIRMAR"
              disabled={!isValidFormScreenPalletValue}
              onPress={confirm}
            />
            <AppButton title="CANCELAR" variant="outline" onPress={cancelMovement} />
          </FormBody>
        </Panel>
      </FormScreenRoot>
    </ListScreenShell>
  );
}

function RoadmapScanWarningModal({
  onClose,
  roadmap,
}: {
  onClose: () => void;
  roadmap: string;
}) {
  return (
    <WarningModalRoot>
      <WarningModalText>
        O roteiro {roadmap} já existe no sistema. Escaneie outro roteiro para continuar.
      </WarningModalText>
      <WarningModalButton onPress={onClose}>
        <WarningModalButtonText>ENTENDI</WarningModalButtonText>
      </WarningModalButton>
    </WarningModalRoot>
  );
}

const FormScreenRoot = styled(View, {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
});

const Panel = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  maxWidth: 560,
  minHeight: 560,
  overflow: "hidden",
  width: "100%",
});

const PanelHeader = styled(View, {
  alignItems: "center",
  backgroundColor: "$primary",
  justifyContent: "center",
  minHeight: 44,
  position: "relative",
});

const PanelHeaderText = styled(Text, {
  ...typography.button,
  color: "$white",
});

const FormBody = styled(View, {
  gap: 16,
  justifyContent: "center",
  padding: 18,
  paddingTop: 48,
});

const HelperText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
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
