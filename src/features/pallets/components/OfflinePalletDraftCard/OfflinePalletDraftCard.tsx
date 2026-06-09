import React from "react";
import { Button, styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";
import {
  buildOfflinePalletOperationSummary,
  OfflinePalletOperation,
} from "../../types/offlinePalletOperation";

type Props = {
  item: OfflinePalletOperation;
  onDelete: (item: OfflinePalletOperation) => void;
  onOpen: (item: OfflinePalletOperation) => void;
};

export function OfflinePalletDraftCard({ item, onDelete, onOpen }: Props) {
  const summary = buildOfflinePalletOperationSummary(item);
  const title = `${item.operationType === "entry" ? "ENTRADA" : "SAÍDA"}: ${item.roadmap ?? "Sem roteiro"}`;
  const statusLabel = item.status === "pending_sync" ? "Pronto para envio" : "Em andamento";

  return (
    <Card>
      <Header>
        <HeaderText>{title}</HeaderText>
      </Header>
      <Body>
        <Row>
          <Line>{summary.progressLabel}</Line>
          <StatusChip status={item.status === "pending_sync" ? "ready" : "draft"}>
            <StatusText>{statusLabel}</StatusText>
          </StatusChip>
        </Row>
        <Muted>Etapa atual: {getStepLabel(summary.nextStep ?? item.currentStep)}</Muted>
        <Muted>Quantidade: {item.formData?.palletsQuantity || "Pendente"}</Muted>
        <Muted>Atualizado em: {formatDate(item.updatedAt)}</Muted>
        <ActionsRow>
          <OpenButton onPress={() => onOpen(item)}>
            <OpenText>Ver resumo</OpenText>
          </OpenButton>
          <DeleteButton onPress={() => onDelete(item)}>
            <DeleteText>Excluir</DeleteText>
          </DeleteButton>
        </ActionsRow>
      </Body>
    </Card>
  );
}

function getStepLabel(step: string) {
  const labels: Record<string, string> = {
    completed: "Completo",
    exit_extra_evidence: "Evidências finais da saída",
    form: "Formulário inicial",
    pallets_evidence: "Evidências dos paletes",
    ship_goods: "Mercadoria embarcada",
  };

  return labels[step] ?? step;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const Card = styled(View, {
  backgroundColor: "$card",
  borderColor: "$primary",
  borderRadius: 18,
  borderWidth: 1.6,
  overflow: "hidden",
});

const Header = styled(View, {
  backgroundColor: "$primary",
  minHeight: 50,
  paddingHorizontal: 16,
  paddingVertical: 14,
});

const HeaderText = styled(Text, {
  ...typography.headingSmall,
  color: "$white",
  textAlign: "center",
});

const Body = styled(View, {
  gap: 8,
  padding: 14,
});

const Row = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  gap: 8,
  justifyContent: "space-between",
});

const Line = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  flex: 1,
});

const Muted = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

const StatusChip = styled(View, {
  borderRadius: 10,
  paddingHorizontal: 10,
  paddingVertical: 4,
  variants: {
    status: {
      draft: { backgroundColor: "$primaryLight" },
      ready: { backgroundColor: "$success" },
    },
  } as const,
});

const StatusText = styled(Text, {
  ...typography.label,
  color: "$black",
});

const ActionsRow = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 8,
});

const OpenText = styled(Text, {
  ...typography.button,
  color: "$primary",
});

const OpenButton = styled(Button, {
  unstyled: true,
  paddingVertical: 6,
});

const DeleteButton = styled(Button, {
  unstyled: true,
  borderColor: "$error",
  borderRadius: 8,
  borderWidth: 1,
  paddingHorizontal: 12,
  paddingVertical: 6,
});

const DeleteText = styled(Text, {
  ...typography.label,
  color: "$error",
});
