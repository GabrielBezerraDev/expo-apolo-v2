import React, { useEffect, useRef, useState } from "react";
import {
  usePreventRemove,
  type NavigationAction,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { styled, Text, View, ScrollView } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useFeedbackModal } from "@shared/components/Display";
import { AppButton } from "@shared/components/Forms/AppButton";
import { useAppHeaderConfig } from "@shared/components/Navigation/AppHeader";
import { typography } from "@shared/typography";
import {
  CountedBinCard,
  ScanFeedback,
  type ScanFeedbackState,
  ScanPrompt,
} from "../../components";
import { useFocusedZebraScanner } from "../../hooks";
import {
  useInventoryCount,
  useInventoryScanAudio,
} from "../../providers";
import { parseBinCode } from "../../services";

type Props = NativeStackScreenProps<RootStackParamList, "NewInventoryCount">;

export function NewInventoryCountScreen({ navigation }: Props) {
  const {
    discardDraft,
    draft,
    finishCount,
    startBin,
  } = useInventoryCount();
  const { playError, playSuccess } = useInventoryScanAudio();
  const { showConfirm } = useFeedbackModal();
  const [isAwaitingBin, setIsAwaitingBin] = useState(true);
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [feedback, setFeedback] = useState<ScanFeedbackState | null>(null);
  const pendingActionRef = useRef<NavigationAction | null>(null);

  useAppHeaderConfig({
    showBack: true,
    showMenu: false,
    title: "Nova contagem",
  });

  useFocusedZebraScanner({
    enabled: Boolean(
      draft && isAwaitingBin && !isConfirmingExit && !isLeaving,
    ),
    onScan: result => {
      const bin = parseBinCode(result.data);
      if (!bin) {
        playError();
        setFeedback({
          message: "Código inválido. Bipe um bin no formato 101 A-07-01.",
          tone: "error",
        });
        return;
      }

      const startResult = startBin(bin);
      if (startResult.status === "duplicate") {
        playError();
        setFeedback({
          message: `O bin ${bin.address} já foi contado nesta contagem.`,
          tone: "error",
        });
        return;
      }
      if (startResult.status === "invalidState") {
        playError();
        setFeedback({
          message: "Não foi possível iniciar este bin. Tente novamente.",
          tone: "error",
        });
        return;
      }

      playSuccess();
      setFeedback(null);
      setIsAwaitingBin(false);
      navigation.navigate("InventoryBinCount", {
        binId: startResult.binId,
      });
    },
    onUnavailable: () => {
      setFeedback({
        message:
          "Leitor Zebra indisponível. Verifique o DataWedge e a instalação do módulo nativo.",
        tone: "error",
      });
    },
  });

  usePreventRemove(Boolean(draft) && !isLeaving, ({ data }) => {
    if (isConfirmingExit) return;

    setIsConfirmingExit(true);
    showConfirm({
      cancelLabel: "Continuar contando",
      confirmLabel: "Descartar contagem",
      confirmVariant: "danger",
      message:
        "Os bins registrados nesta contagem serão descartados e não aparecerão na lista.",
      modalOptions: { groupId: "discard-inventory-count" },
      onCancel: () => setIsConfirmingExit(false),
      onConfirm: () => {
        pendingActionRef.current = data.action;
        discardDraft();
        setIsLeaving(true);
      },
      title: "Descartar contagem?",
    });
  });

  useEffect(() => {
    if (!draft && !isLeaving) {
      setIsLeaving(true);
    }
  }, [draft, isLeaving]);

  useEffect(() => {
    if (
      draft &&
      !draft.activeBin &&
      draft.bins.length === 0 &&
      !isLeaving
    ) {
      setIsAwaitingBin(true);
    }
  }, [draft, isLeaving]);

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

  const requestFinish = () => {
    setIsConfirmingExit(true);
    showConfirm({
      cancelLabel: "Continuar contando",
      confirmLabel: "Finalizar contagem",
      confirmVariant: "primary",
      message: `A contagem possui ${draft?.bins.length ?? 0} bin(s) concluído(s).`,
      modalOptions: { groupId: "finish-inventory-count" },
      onCancel: () => setIsConfirmingExit(false),
      onConfirm: () => {
        if (!finishCount()) {
          setIsConfirmingExit(false);
          setFeedback({
            message: "Conclua pelo menos um bin antes de finalizar a contagem.",
            tone: "error",
          });
          return;
        }

        setIsLeaving(true);
      },
      title: "Finalizar contagem?",
    });
  };

  if (!draft) return <Screen />;

  return (
    <Screen>
      <Content
        contentContainerStyle={{
          gap: 16,
          paddingBottom: 28,
          paddingHorizontal: 14,
          paddingTop: 14,
        }}
      >
        {draft.bins.length > 0 ? (
          <Section>
            <SectionTitle>Bins concluídos</SectionTitle>
            <SectionDescription>
              {draft.bins.length} bin(s) registrado(s) nesta contagem.
            </SectionDescription>
            {draft.bins.map(bin => (
              <CountedBinCard key={bin.id} bin={bin} />
            ))}
          </Section>
        ) : null}

        {feedback ? <ScanFeedback {...feedback} /> : null}

        {isAwaitingBin ? (
          <>
            <ScanPrompt
              title="Bipe um bin para começar a contagem"
              description="O endereço será identificado após o prefixo numérico."
            />
            {draft.bins.length > 0 ? (
              <AppButton
                title="Voltar ao resumo"
                variant="outline"
                onPress={() => {
                  setFeedback(null);
                  setIsAwaitingBin(false);
                }}
              />
            ) : null}
          </>
        ) : (
          <Actions>
            <ActionIntroduction>
              Escolha se deseja contar outro bin ou finalizar a contagem atual.
            </ActionIntroduction>
            <AppButton
              title="Adicionar novo bin"
              onPress={() => {
                setFeedback(null);
                setIsAwaitingBin(true);
              }}
            />
            <AppButton
              title="Finalizar contagem"
              variant="outline"
              disabled={draft.bins.length === 0}
              onPress={requestFinish}
            />
          </Actions>
        )}
      </Content>
    </Screen>
  );
}

const Screen = styled(View, {
  backgroundColor: "$background",
  flex: 1,
});

const Content = styled(ScrollView, {
  flex: 1,
});

const Section = styled(View, {
  gap: 10,
});

const SectionTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
});

const SectionDescription = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
});

const Actions = styled(View, {
  backgroundColor: "$surface",
  borderColor: "$border",
  borderRadius: 20,
  borderWidth: 1,
  gap: 11,
  padding: 16,
});

const ActionIntroduction = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  textAlign: "center",
});
