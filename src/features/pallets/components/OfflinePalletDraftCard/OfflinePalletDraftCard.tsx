import React from "react";
import { Button, styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";
import { OfflinePalletOperation, OfflinePalletOperationStep, OfflineValidationIssue } from "../../protocol";
import { buildOfflinePalletOperationSummary } from "../../services/offlinePalletOperations";

type Props = {
  item: OfflinePalletOperation;
  onDelete: (item: OfflinePalletOperation) => void;
  onOpen: (item: OfflinePalletOperation) => void;
  onReviewStage?: (item: OfflinePalletOperation, stage: OfflinePalletOperationStep) => void;
  onRetry?: (item: OfflinePalletOperation) => void;
};

export function OfflinePalletDraftCard({ item, onDelete, onOpen, onReviewStage, onRetry }: Props) {
  const summary = buildOfflinePalletOperationSummary(item);
  const title = `${item.operationType === "entry" ? "ENTRADA" : "SAÍDA"}: ${item.roadmap ?? "Sem roteiro"}`;
  const status = getStatusPresentation(item.status);
  const validationGroups = groupValidationIssuesByStage(item.validationIssues);

  return (
    <Card>
      <Header>
        <HeaderText>{title}</HeaderText>
      </Header>
      <Body>
        <Row>
          <Line>{summary.progressLabel}</Line>
          <StatusChip status={status.variant}>
            <StatusText>{status.label}</StatusText>
          </StatusChip>
        </Row>
        {item.status === "failed" && item.lastError ? (
          <ErrorLine>{item.lastError}</ErrorLine>
        ) : null}
        {item.status === "validation_failed" ? (
          <ValidationBox>
            <ValidationTitle>Corrija as pendências abaixo antes de sincronizar.</ValidationTitle>
            {validationGroups.length > 0 ? validationGroups.map(group => {
              return (
              <ValidationGroup key={group.stage}>
                <ValidationGroupTitle>{getStepLabel(group.stage)}</ValidationGroupTitle>
                {group.issues.map((issue, index) => (
                  <ErrorLine key={`${group.stage}-${index}`}>{formatIssueMessage(issue)}</ErrorLine>
                ))}
                {onReviewStage ? (
                  <ReviewStageButton onPress={() => onReviewStage(item, group.stage)}>
                    <ReviewStageText>{getReviewButtonLabel(group.stage)}</ReviewStageText>
                  </ReviewStageButton>
                ) : null}
              </ValidationGroup>
            )
            }) : (
              <ErrorLine>{item.lastError ?? "Operação precisa ser revisada."}</ErrorLine>
            )}
          </ValidationBox>
        ) : null}
        <Muted>Etapa atual: {getStepLabel(summary.nextStep ?? item.currentStep)}</Muted>
        <Muted>Quantidade: {item.formData?.palletsQuantity || "Pendente"}</Muted>
        <Muted>Atualizado em: {formatDate(item.updatedAt)}</Muted>
        <ActionsRow>
          <OpenButton onPress={() => onOpen(item)}>
            <OpenText>Ver resumo</OpenText>
          </OpenButton>
          {item.status === "failed" && onRetry ? (
            <RetryButton onPress={() => onRetry(item)}>
              <RetryText>Tentar novamente</RetryText>
            </RetryButton>
          ) : null}
          <DeleteButton onPress={() => onDelete(item)}>
            <DeleteText>Excluir</DeleteText>
          </DeleteButton>
        </ActionsRow>
      </Body>
    </Card>
  );
}

function getStatusPresentation(status: OfflinePalletOperation["status"]): {
  label: string;
  variant: "draft" | "failed" | "ready" | "review" | "syncing";
} {
  if (status === "pending_sync") return { label: "Pronto para envio", variant: "ready" };
  if (status === "validation_failed") return { label: "Revisar validação", variant: "review" };
  if (status === "failed") return { label: "Falha no envio", variant: "failed" };
  if (status === "syncing") return { label: "Sincronizando", variant: "syncing" };
  return { label: "Em andamento", variant: "draft" };
}

function getStepLabel(step: string) {
  const labels: Record<string, string> = {
    completed: "Completo",
    exit_extra_evidence: "Evidências finais da saída",
    form: "Dados iniciais",
    pallets_evidence: "Evidências dos paletes",
    ship_goods: "Evidências finais da saída",
  };

  return labels[step] ?? step;
}

function getReviewButtonLabel(step: OfflinePalletOperationStep) {
  const labels: Record<OfflinePalletOperationStep, string> = {
    completed: "REVISAR RESUMO",
    exit_extra_evidence: "REVISAR EVIDÊNCIAS FINAIS",
    form: "REVISAR DADOS INICIAIS",
    pallets_evidence: "REVISAR EVIDÊNCIAS DOS PALETES",
    ship_goods: "REVISAR EVIDÊNCIAS FINAIS",
  };

  return labels[step];
}

function groupValidationIssuesByStage(issues?: OfflineValidationIssue[]) {
  if (!issues?.length) return [];

  const stageOrder: OfflinePalletOperationStep[] = [
    "form",
    "pallets_evidence",
    "ship_goods",
    "exit_extra_evidence",
    "completed",
  ];

  return stageOrder
    .map(stage => ({
      issues: issues.filter(issue => issue.stage === stage),
      stage,
    }))
    .filter(group => group.issues.length > 0);
}

function formatIssueMessage(issue: OfflineValidationIssue) {
  if (issue.batch) return `${issue.batch}: ${issue.message}`;
  if (issue.palletIndex != null) return `Palete ${issue.palletIndex + 1}: ${issue.message}`;

  return issue.message;
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

const ErrorLine = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
  fontWeight: "700",
});

const ValidationBox = styled(View, {
  backgroundColor: "$surface",
  borderColor: "$warning",
  borderRadius: 12,
  borderWidth: 1,
  gap: 10,
  padding: 12,
});

const ValidationTitle = styled(Text, {
  ...typography.bodySmall,
  color: "$text",
  fontWeight: "800",
});

const ValidationGroup = styled(View, {
  gap: 6,
});

const ValidationGroupTitle = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "900",
});

const ReviewStageButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  alignSelf: "flex-start",
  borderColor: "$primary",
  borderRadius: 8,
  borderWidth: 1,
  marginTop: 2,
  paddingHorizontal: 12,
  paddingVertical: 7,
});

const ReviewStageText = styled(Text, {
  ...typography.label,
  color: "$primary",
  fontWeight: "900",
});

const StatusChip = styled(View, {
  borderRadius: 10,
  paddingHorizontal: 10,
  paddingVertical: 4,
  variants: {
    status: {
      draft: { backgroundColor: "$primaryLight" },
      failed: { backgroundColor: "$error" },
      ready: { backgroundColor: "$success" },
      review: { backgroundColor: "$warning" },
      syncing: { backgroundColor: "$primaryLight" },
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

const RetryButton = styled(Button, {
  unstyled: true,
  borderColor: "$primary",
  borderRadius: 8,
  borderWidth: 1,
  paddingHorizontal: 12,
  paddingVertical: 6,
});

const RetryText = styled(Text, {
  ...typography.label,
  color: "$primary",
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
