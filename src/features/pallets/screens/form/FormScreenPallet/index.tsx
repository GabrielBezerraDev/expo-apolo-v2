import React, { useCallback, useMemo } from "react";
import { useFormState } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera } from "lucide-react-native";
import { Button, styled, Text, useWindowDimensions, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useFrame } from "@features/camera";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { useFeedbackModal } from "@shared/components/Display/Modal";
import { AppButton } from "@shared/components/Forms/AppButton";
import { hasApiBaseUrl, isApiNetworkError } from "@shared/services/apiClient";
import { AppInput } from "@shared/components/Forms/AppInput";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { fontScale, typography } from "@shared/typography";
import { useOfflinePalletOperation } from "../../../services/offlinePalletOperations";
import { getOfflinePalletOperationByRoadmap } from "../../../services/offlinePalletOperations";
import { useRoadmapApi } from "../../../services/roadmapApi";
import { usePallet } from "../../../providers/PalletProvider";
import { FormScreenPalletType } from "../../../protocol";
import { ListScreenShell } from "../../../components/ListScreenShell";
import { MovementCancelButton } from "../../../components/MovementCancelButton";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function FormScreenPallet() {
  const navigation = useNavigation<Navigation>();
  const { configureScanner } = useFrame();
  const { showConfirm, showFeedback } = useFeedbackModal();
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
  const { errors } = useFormState({ control: controlFormScreenPallet });



  const navigator = useNavigation();
  const { height } = useWindowDimensions();
  const operationLabel = operationPallet === "exit" ? "saída" : "entrada";
  const clearScannedRoadmap = useCallback(() => {
    setFormScreenPalletValue("roadmap", "", { shouldValidate: true });
  }, [setFormScreenPalletValue]);

  const openRoadmapExistsModal = useCallback((scannedRoadmap: string) => {
    showFeedback({
      title: "Roteiro já existe",
      message: `O roteiro ${scannedRoadmap} já existe no sistema. Escaneie outro roteiro para continuar.`,
    });
  }, [showFeedback]);

  const openPendingValidationModal = useCallback(() => {
    showFeedback({
      title: "Validação pendente",
      message: "Sem conexão com Internet. O roteiro foi salvo e será validado automaticamente na sincronização.",
    });
  }, [showFeedback]);

  const scanRoadmap = useCallback(() => {
    configureScanner({
      mode: "scanner",
      preset: "tinyDataLandScape",
      orientation: "LandScape",
      onCapture: async (data) => {
        const scannedRoadmap = data.text.trim();
        const roadmapValidation = await validateScannedRoadmap({ roadmap: scannedRoadmap, roadmapApi });

        if (roadmapValidation === "exists") {
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

        if (roadmapValidation === "skipped") {
          requestAnimationFrame(openPendingValidationModal);
        }
      },
      onCancel: () => navigator.goBack(),
      formatTextDataWithRegex: (data) => data.replace(/[^a-zA-Z0-9\s]/g, ""),
    });
    navigation.navigate('Scanner');
  }, [clearScannedRoadmap, configureScanner, navigation, navigator, openPendingValidationModal, openRoadmapExistsModal, roadmapApi, saveFormDraft, setFormScreenPalletValue]);

  const formSubtitle = useMemo(() => {
    if (!route) return "Escaneie o roteiro e informe a quantidade de paletes.";
    return `Roteiro ${route}`;
  }, [route]);

  const confirm = async () => {
    const currentRoadmap = getValeusScreenPallet("roadmap").trim();
    const existingOperation = await getOfflinePalletOperationByRoadmap(currentRoadmap, operationPallet);

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

    showConfirm({
      title: `Cancelar ${operationLabel}`,
      message: "Esta movimentação será salva como rascunho. Você poderá continuar depois. Deseja sair agora?",
      cancelLabel: "Continuar preenchendo",
      confirmLabel: "Salvar rascunho e sair",
      onConfirm: async () => {
        await saveFormDraft({ currentStep: "form" });
        resetEntry();
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      },
    });
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
              error={errors.roadmap?.message}
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
              error={errors.palletsQuantity?.message}
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

async function validateScannedRoadmap({
  roadmap,
  roadmapApi,
}: {
  roadmap: string;
  roadmapApi: ReturnType<typeof useRoadmapApi>;
}) {
  if (!hasApiBaseUrl() || !roadmapApi.hasAuthToken) return "skipped";

  try {
    const exists = await roadmapApi.roadmapExists(roadmap);
    return exists ? "exists" : "validated";
  } catch (error) {
    if (isApiNetworkError(error)) return "skipped";
    throw error;
  }
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
  pressStyle: buttonPressStyle,
});
