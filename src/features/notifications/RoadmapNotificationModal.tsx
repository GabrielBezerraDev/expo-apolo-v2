import React from "react";
import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";
import type { RoadmapHistoryChangeSocket } from "./notifications.types";

type Props = {
  notification: RoadmapHistoryChangeSocket;
};

export function RoadmapNotificationModal({ notification }: Props) {
  const userName = getUserName(notification);
  const typeLabel = getRoadmapTypeLabel(notification.typeRoadmap);
  const statusLabel = getStatusLabel(notification.statusRoadmap);
  const palletCount = notification.palletIds?.length ?? 0;

  return (
    <NotificationRoot>
      <MetaRow>
        <TypePill typeRoadmap={notification.typeRoadmap === "EXIT" ? "exit" : "entry"}>
          <TypePillText>{typeLabel}</TypePillText>
        </TypePill>
        <StatusText>{statusLabel}</StatusText>
      </MetaRow>

      <DescriptionText>{notification.description}</DescriptionText>

      {palletCount > 0 ? (
        <DetailText>
          {palletCount} {palletCount === 1 ? "palete associado" : "paletes associados"}
        </DetailText>
      ) : null}

      {userName ? (
        <DetailText>
          <DetailLabel>Atualizado por: </DetailLabel>
          {userName}
        </DetailText>
      ) : null}

      {notification.user?.email ? (
        <DetailText>
          <DetailLabel>Email: </DetailLabel>
          {notification.user.email}
        </DetailText>
      ) : null}
    </NotificationRoot>
  );
}

function getRoadmapTypeLabel(typeRoadmap: string) {
  if (typeRoadmap === "ENTRY") return "Entrada";
  if (typeRoadmap === "EXIT") return "Saída";
  return typeRoadmap;
}

function getStatusLabel(statusRoadmap: string) {
  if (statusRoadmap === "FINISHED") return "Finalizado";
  if (statusRoadmap === "IN_PROGRESS") return "Em andamento";
  return statusRoadmap;
}

function getUserName(notification: RoadmapHistoryChangeSocket) {
  const name = [notification.user?.name, notification.user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || undefined;
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

const TypePill = styled(View, {
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 6,
  variants: {
    typeRoadmap: {
      entry: {
        backgroundColor: "$primary",
      },
      exit: {
        backgroundColor: "$warning",
      },
    },
  } as const,
});

const TypePillText = styled(Text, {
  ...typography.label,
  color: "$white",
  fontWeight: "900",
  textTransform: "uppercase",
});

const StatusText = styled(Text, {
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
