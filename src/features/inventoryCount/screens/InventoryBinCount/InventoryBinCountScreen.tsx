import React, { useEffect, useRef, useState } from "react";
import {
  usePreventRemove,
  type NavigationAction,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlatList } from "react-native";
import { ScanLine } from "lucide-react-native";
import { styled, Text, View, XStack } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { useFeedbackModal } from "@shared/components/Display";
import { useAppHeaderConfig } from "@shared/components/Navigation/AppHeader";
import { typography } from "@shared/typography";
import {
  MaterialScanCard,
  ScanFeedback,
  type ScanFeedbackState,
} from "../../components";
import { useFocusedZebraScanner } from "../../hooks";
import { useInventoryCount } from "../../providers";
import { parseBinCode, parseMaterialCode } from "../../services";

type Props = NativeStackScreenProps<RootStackParamList, "InventoryBinCount">;

export function InventoryBinCountScreen({ navigation, route }: Props) {
  const {
    addMaterial,
    cancelActiveBin,
    completeActiveBin,
    draft,
  } = useInventoryCount();
  const { showConfirm } = useFeedbackModal();
  const { theme } = useThemeMode();
  const [feedback, setFeedback] = useState<ScanFeedbackState | null>(null);
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const pendingActionRef = useRef<NavigationAction | null>(null);
  const activeBin =
    draft?.activeBin?.id === route.params.binId ? draft.activeBin : undefined;
  const materials = [...(activeBin?.materials ?? [])].reverse();
  const totalQuantity = materials.reduce(
    (total, material) => total + material.quantity,
    0,
  );

  const showError = (message: string) => {
    setFeedback({ message, tone: "error" });
  };

  const showSuccess = (message: string) => {
    setFeedback(current =>
      current?.tone === "error" ? current : { message, tone: "success" },
    );
  };

  useAppHeaderConfig({
    showBack: true,
    showMenu: false,
    title: activeBin ? `Bin ${activeBin.address}` : "Contagem do bin",
  });

  useFocusedZebraScanner({
    enabled: Boolean(activeBin && !isConfirmingExit && !isLeaving),
    onScan: result => {
      if (!activeBin) return;

      const scannedBin = parseBinCode(result.data);
      if (scannedBin) {
        if (scannedBin.address !== activeBin.address) {
          showError(
            `O bin ativo é ${activeBin.address}. Bipe esse mesmo bin para concluir.`,
          );
          return;
        }

        if (completeActiveBin()) {
          setIsLeaving(true);
        }
        return;
      }

      const material = parseMaterialCode(result.data);
      if (!material) {
        showError("Etiqueta inválida. Verifique o material e bipe novamente.");
        return;
      }

      const addResult = addMaterial(material);
      if (addResult === "duplicate") {
        showError(`A etiqueta ${material.labelId} já foi contada.`);
        return;
      }
      if (addResult === "invalidState") {
        showError("Não foi possível adicionar a etiqueta ao bin atual.");
        return;
      }

      showSuccess(`Material ${material.materialCode} adicionado.`);
    },
    onUnavailable: () => {
      showError(
        "Leitor Zebra indisponível. Verifique o DataWedge e a instalação do módulo nativo.",
      );
    },
  });

  usePreventRemove(Boolean(activeBin) && !isLeaving, ({ data }) => {
    if (isConfirmingExit) return;

    setIsConfirmingExit(true);
    showConfirm({
      cancelLabel: "Continuar contando",
      confirmLabel: "Descartar bin",
      confirmVariant: "danger",
      message: `As ${activeBin?.materials.length ?? 0} etiqueta(s) bipada(s) neste bin serão descartadas.`,
      modalOptions: { groupId: "discard-active-inventory-bin" },
      onCancel: () => setIsConfirmingExit(false),
      onConfirm: () => {
        pendingActionRef.current = data.action;
        cancelActiveBin();
        setIsLeaving(true);
      },
      title: "Sair deste bin?",
    });
  });

  useEffect(() => {
    if (!activeBin && !isLeaving) {
      setIsLeaving(true);
    }
  }, [activeBin, isLeaving]);

  useEffect(() => {
    if (!isLeaving) return;

    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    } else {
      navigation.goBack();
    }
  }, [isLeaving, navigation]);

  useEffect(() => {
    if (feedback?.tone !== "success") return;

    const visibleFeedback = feedback;
    const timeout = setTimeout(() => {
      setFeedback(current => (current === visibleFeedback ? null : current));
    }, 5000);

    return () => clearTimeout(timeout);
  }, [feedback]);

  return (
    <Screen>
      <FlatList
        data={materials}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MaterialScanCard material={item} />}
        contentContainerStyle={{
          flexGrow: materials.length === 0 ? 1 : undefined,
          gap: 12,
          paddingBottom: 14,
          paddingHorizontal: 14,
          paddingTop: 14,
        }}
        ListEmptyComponent={
          <EmptyMaterials>
            <EmptyTitle>Nenhum material bipado</EmptyTitle>
            <EmptyDescription>
              Use o gatilho do PDA para registrar a primeira etiqueta.
            </EmptyDescription>
          </EmptyMaterials>
        }
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {feedback ? (
        <ToastOverlay pointerEvents="box-none">
          <ScanFeedback
            {...feedback}
            onClose={
              feedback.tone === "error" ? () => setFeedback(null) : undefined
            }
          />
        </ToastOverlay>
      ) : null}

      <CountFooter>
        <ScanLine size={21} color={theme.primary} />
        <SummaryText>
          {materials.length} etiqueta(s) · {totalQuantity.toLocaleString("pt-BR", {
            maximumFractionDigits: 3,
          })} unidades
        </SummaryText>
      </CountFooter>
    </Screen>
  );
}

const Screen = styled(View, {
  backgroundColor: "$background",
  flex: 1,
});

const CountFooter = styled(XStack, {
  alignItems: "center",
  backgroundColor: "$card",
  borderTopColor: "$border",
  borderTopWidth: 1,
  flexShrink: 0,
  gap: 8,
  minHeight: 50,
  paddingHorizontal: 14,
  paddingVertical: 9,
});

const SummaryText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "600",
});

const ToastOverlay = styled(View, {
  left: 12,
  position: "absolute",
  right: 12,
  top: 12,
  zIndex: 50,
});

const EmptyMaterials = styled(View, {
  alignItems: "center",
  flex: 1,
  gap: 6,
  justifyContent: "center",
  padding: 24,
});

const EmptyTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
  textAlign: "center",
});

const EmptyDescription = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
  textAlign: "center",
});
