import React from "react";
import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";
import type { PalletHistoryChangeSocket } from "../../protocol";

type Props = {
  notification: PalletHistoryChangeSocket;
};

export function PalletNotificationModal({ notification }: Props) {
  const userName = getUserName(notification);
  const operationLabel = getOperationLabel(notification.typeOperation);

  return (
    <NotificationRoot>
      <MetaRow>
        <OperationPill operation={getOperationVariant(notification.typeOperation)}>
          <OperationPillText>{operationLabel}</OperationPillText>
        </OperationPill>
        {notification.batch ? <BatchText>Lote {notification.batch}</BatchText> : null}
      </MetaRow>

      <DescriptionText>{notification.description}</DescriptionText>

      {userName ? (
        <DetailText>
          <DetailLabel>Atualizado por: </DetailLabel>
          {userName}
        </DetailText>
      ) : null}

      {notification.email ? (
        <DetailText>
          <DetailLabel>Email: </DetailLabel>
          {notification.email}
        </DetailText>
      ) : null}
    </NotificationRoot>
  );
}

function getUserName(notification: PalletHistoryChangeSocket) {
  const name = [notification.name, notification.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || undefined;
}

function getOperationLabel(typeOperation: string) {
  if (typeOperation === "CREATE") return "Criado";
  if (typeOperation === "UPDATE") return "Atualizado";
  if (typeOperation === "DELETE") return "Removido";
  return typeOperation;
}

function getOperationVariant(typeOperation: string) {
  if (typeOperation === "CREATE") return "create";
  if (typeOperation === "DELETE") return "delete";
  return "update";
}

const NotificationRoot = styled(View, {
  gap: 10,
});

const MetaRow = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  gap: 10,
  justifyContent: "space-between",
});

const OperationPill = styled(View, {
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 6,
  variants: {
    operation: {
      create: { backgroundColor: "$success" },
      delete: { backgroundColor: "$error" },
      update: { backgroundColor: "$primary" },
    },
  } as const,
});

const OperationPillText = styled(Text, {
  ...typography.label,
  color: "$white",
  fontWeight: "900",
  textTransform: "uppercase",
});

const BatchText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "800",
  textTransform: "uppercase",
});

const DescriptionText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "800",
});

const DetailText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
});

const DetailLabel = styled(Text, {
  ...typography.bodySmall,
  color: "$text",
  fontWeight: "900",
});
