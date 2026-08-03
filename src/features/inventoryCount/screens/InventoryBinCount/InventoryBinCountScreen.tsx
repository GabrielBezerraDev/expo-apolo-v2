import React, { useEffect, useRef, useState } from "react";
import {
  usePreventRemove,
  type NavigationAction,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SectionList } from "react-native";
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
import {
  useInventoryCount,
  useInventoryScanAudio,
} from "../../providers";
import { parseBinCode, parseMaterialCode } from "../../services";
import { InventoryMaterialGroupHeader } from "./InventoryMaterialGroupHeader";
import { InventoryOrganizationTabs } from "./InventoryOrganizationTabs";
import {
  buildInventoryMaterialSections,
  type InventoryMaterialSection,
  type InventoryOrganizationMode,
} from "./inventoryMaterialGrouping";

type Props = NativeStackScreenProps<RootStackParamList, "InventoryBinCount">;

export function InventoryBinCountScreen({ navigation, route }: Props) {
  const {
    addMaterial,
    cancelActiveBin,
    completeActiveBin,
    draft,
  } = useInventoryCount();
  const { playError, playSuccess } = useInventoryScanAudio();
  const { showConfirm } = useFeedbackModal();
  const { theme } = useThemeMode();
  const [feedback, setFeedback] = useState<ScanFeedbackState | null>(null);
  const [organizationMode, setOrganizationMode] =
    useState<InventoryOrganizationMode>("labelId");
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(
    () => new Set(),
  );
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
  const materialSections = buildInventoryMaterialSections(
    materials,
    organizationMode,
    expandedGroupKeys,
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
          playError();
          showError(
            `O bin ativo é ${activeBin.address}. Bipe esse mesmo bin para concluir.`,
          );
          return;
        }

        if (completeActiveBin()) {
          playSuccess();
          setIsLeaving(true);
        } else {
          playError();
          showError("Não foi possível concluir o bin atual.");
        }
        return;
      }

      const material = parseMaterialCode(result.data);
      if (!material) {
        playError();
        showError("Etiqueta inválida. Verifique o material e bipe novamente.");
        return;
      }

      const addResult = addMaterial(material);
      if (addResult === "duplicate") {
        playError();
        showError(`A etiqueta ${material.labelId} já foi contada.`);
        return;
      }
      if (addResult === "invalidState") {
        playError();
        showError("Não foi possível adicionar a etiqueta ao bin atual.");
        return;
      }

      playSuccess();
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

  const changeOrganizationMode = (nextMode: InventoryOrganizationMode) => {
    setOrganizationMode(nextMode);
    setExpandedGroupKeys(new Set());
  };

  const toggleGroup = (section: InventoryMaterialSection) => {
    if (section.kind === "labelId") return;

    setExpandedGroupKeys(current => {
      const next = new Set(current);
      if (next.has(section.key)) {
        next.delete(section.key);
      } else {
        next.add(section.key);
      }
      return next;
    });
  };

  return (
    <Screen>
      <OrganizationControl>
        <InventoryOrganizationTabs
          value={organizationMode}
          onChange={changeOrganizationMode}
        />
      </OrganizationControl>

      <SectionList
        sections={materialSections}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MaterialScanCard material={item} />}
        renderSectionHeader={({ section }) =>
          section.kind === "labelId" ? null : (
            <InventoryMaterialGroupHeader
              expanded={section.expanded}
              itemCount={section.itemCount}
              kind={section.kind}
              onPress={() => toggleGroup(section)}
              title={section.title}
              totalQuantity={section.totalQuantity}
            />
          )
        }
        ItemSeparatorComponent={ListItemSeparator}
        SectionSeparatorComponent={ListSectionSeparator}
        extraData={expandedGroupKeys}
        contentContainerStyle={{
          flexGrow: materials.length === 0 ? 1 : undefined,
          paddingBottom: 14,
          paddingHorizontal: 14,
          gap: 4
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
        stickySectionHeadersEnabled={false}
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
        <SummaryText numberOfLines={1}>
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

const OrganizationControl = styled(View, {
  paddingBottom: 8,
  paddingHorizontal: 14,
  paddingTop: 10,
});

const CountFooter = styled(XStack, {
  alignItems: "center",
  backgroundColor: "$card",
  borderTopColor: "$border",
  borderTopWidth: 1,
  flexShrink: 0,
  gap: 8,
  height: 50,
  paddingHorizontal: 14,
  paddingVertical: 9,
});

const SummaryText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  flex: 1,
  fontWeight: "600",
});

const ToastOverlay = styled(View, {
  bottom: 58,
  left: 12,
  position: "absolute",
  right: 12,
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

function ListItemSeparator() {
  return <View height={12} />;
}

function ListSectionSeparator() {
  return <View height={12} />;
}
