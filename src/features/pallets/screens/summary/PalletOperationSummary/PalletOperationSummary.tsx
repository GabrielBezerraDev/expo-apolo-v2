import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Image, ScrollView, styled, Text, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { LottieAnimLoading } from "@shared/components/Feedback";
import { AppButton } from "@shared/components/Forms/AppButton";
import { typography } from "@shared/typography";
import { ListScreenShell } from "../../../components/ListScreenShell";
import { usePalletOperationSummary } from "./usePalletOperationSummary";

type Props = NativeStackScreenProps<RootStackParamList, "PalletOperationSummary">;

export function PalletOperationSummary({ navigation, route }: Props) {
  const { continueDraft, deleteDraft, isLoading, operation, summary } = usePalletOperationSummary({
    navigation,
    operationId: route.params.operationId,
  });

  if (isLoading) {
    return (
      <ListScreenShell title="Resumo do rascunho">
        <LoadingFrame>
          <LottieAnimLoading label="Carregando resumo" />
        </LoadingFrame>
      </ListScreenShell>
    );
  }

  if (!operation || !summary) {
    return (
      <ListScreenShell title="Resumo do rascunho">
        <EmptyFrame>
          <EmptyText>Rascunho não encontrado.</EmptyText>
        </EmptyFrame>
      </ListScreenShell>
    );
  }

  const canContinue = Boolean(summary.nextStep);

  return (
    <ListScreenShell title="Resumo do rascunho">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={contentStyle}>
        <HeaderCard>
          <HeaderTitle>{operation.roadmap ?? "Sem roteiro"}</HeaderTitle>
          <HeaderText>{operation.operationType === "entry" ? "Entrada" : "Saída"}</HeaderText>
          <HeaderText>{summary.progressLabel}</HeaderText>
          <StatusText>{operation.status === "pending_sync" ? "Pronto para envio" : "Em andamento"}</StatusText>
        </HeaderCard>

        {summary.sections.map(section => (
          <SectionCard key={section.title}>
            <SectionHeader>
              <SectionTitle>{section.title}</SectionTitle>
              <SectionStatus status={section.status}>
                <SectionStatusText>{getStatusLabel(section.status)}</SectionStatusText>
              </SectionStatus>
            </SectionHeader>
            {section.items.map((item, index) => (
              <SummaryItem key={`${item.label}-${index}`}>
                {item.thumbnailUri ? <Thumbnail src={item.thumbnailUri} /> : null}
                <ItemBody>
                  <ItemLabel>{item.label}</ItemLabel>
                  <ItemValue status={item.status}>{item.value}</ItemValue>
                </ItemBody>
              </SummaryItem>
            ))}
          </SectionCard>
        ))}

        <Actions>
          <AppButton
            title={canContinue ? "CONTINUAR PREENCHIMENTO" : "PRONTO PARA ENVIO"}
            disabled={!canContinue}
            onPress={continueDraft}
          />
          <DeleteButton onPress={deleteDraft}>
            <DeleteText>EXCLUIR RASCUNHO</DeleteText>
          </DeleteButton>
        </Actions>
      </ScrollView>
    </ListScreenShell>
  );
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    complete: "Completo",
    not_started: "Não iniciado",
    pending: "Pendente",
  };

  return labels[status] ?? status;
}

const contentStyle = {
  gap: 14,
  paddingBottom: 28,
  paddingVertical: 16,
};

const LoadingFrame = styled(View, {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
});

const EmptyFrame = styled(View, {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
});

const EmptyText = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
});

const HeaderCard = styled(View, {
  backgroundColor: "$card",
  borderColor: "$primary",
  borderRadius: 16,
  borderWidth: 1,
  gap: 6,
  padding: 16,
});

const HeaderTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
});

const HeaderText = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
});

const StatusText = styled(Text, {
  ...typography.button,
  color: "$primary",
});

const SectionCard = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  gap: 10,
  padding: 14,
});

const SectionHeader = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
});

const SectionTitle = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "800",
});

const SectionStatus = styled(View, {
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 4,
  variants: {
    status: {
      complete: { backgroundColor: "$success" },
      not_started: { backgroundColor: "$grey" },
      pending: { backgroundColor: "$warning" },
    },
  } as const,
});

const SectionStatusText = styled(Text, {
  ...typography.label,
  color: "$black",
});

const SummaryItem = styled(View, {
  alignItems: "center",
  borderTopColor: "$border",
  borderTopWidth: 1,
  flexDirection: "row",
  gap: 10,
  paddingTop: 10,
});

const Thumbnail = styled(Image, {
  borderRadius: 10,
  height: 52,
  width: 52,
});

const ItemBody = styled(View, {
  flex: 1,
  gap: 2,
});

const ItemLabel = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

const ItemValue = styled(Text, {
  ...typography.bodyMedium,
  variants: {
    status: {
      complete: { color: "$text" },
      not_started: { color: "$mutedText" },
      pending: { color: "$error" },
    },
  } as const,
});

const Actions = styled(View, {
  gap: 12,
  marginTop: 4,
});

const DeleteButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  borderColor: "$error",
  borderRadius: 14,
  borderWidth: 1,
  justifyContent: "center",
  minHeight: 50,
});

const DeleteText = styled(Text, {
  ...typography.button,
  color: "$error",
});
