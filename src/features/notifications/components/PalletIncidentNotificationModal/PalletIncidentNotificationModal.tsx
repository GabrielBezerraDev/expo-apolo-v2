import React from "react";
import { styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";
import type { PalletIncidentCreatedSocket } from "../../protocol";

type Props = {
  notification: PalletIncidentCreatedSocket;
};

const INCIDENT_STAGE_LABELS: Record<PalletIncidentCreatedSocket["incidentStage"], string> = {
  WIP: "Qualidade",
  STORAGE: "Estoque",
  VALORLOG_ENTRY: "Entrada na Valorlog",
};

const DESTINATION_LABELS: Record<
  PalletIncidentCreatedSocket["changedPalletStageTo"],
  string
> = {
  STORAGE: "Estoque",
  VALORLOG_ENTRY: "Entrada na Valorlog",
  VALORLOG_EXIT: "Saida da Valorlog",
};

export function PalletIncidentNotificationModal({ notification }: Props) {
  return (
    <NotificationRoot>
      <MetaRow>
        <IncidentPill>
          <IncidentPillText>Incidente</IncidentPillText>
        </IncidentPill>
        <BatchText>Lote {notification.palletBatch}</BatchText>
      </MetaRow>

      <DetailText>
        <DetailLabel>Motivo: </DetailLabel>
        {notification.incidentDescription}
      </DetailText>

      <DetailText>
        <DetailLabel>Reportado por: </DetailLabel>
        {notification.reportedBySRSUserName}
      </DetailText>

      <StageRow>
        <StageDetail>
          <StageLabel>Etapa do incidente</StageLabel>
          <StageValue>{INCIDENT_STAGE_LABELS[notification.incidentStage]}</StageValue>
        </StageDetail>
        <StageDetail>
          <StageLabel>Destino</StageLabel>
          <StageValue>{DESTINATION_LABELS[notification.changedPalletStageTo]}</StageValue>
        </StageDetail>
      </StageRow>
    </NotificationRoot>
  );
}

const NotificationRoot = styled(View, {
  gap: 12,
});

const MetaRow = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  gap: 10,
  justifyContent: "space-between",
});

const IncidentPill = styled(View, {
  backgroundColor: "$error",
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 6,
});

const IncidentPillText = styled(Text, {
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

const StageRow = styled(View, {
  flexDirection: "row",
  gap: 12,
});

const StageDetail = styled(View, {
  backgroundColor: "$background",
  borderColor: "$border",
  borderRadius: 12,
  borderWidth: 1,
  flex: 1,
  gap: 4,
  padding: 10,
});

const StageLabel = styled(Text, {
  ...typography.label,
  color: "$mutedText",
  fontWeight: "800",
  textTransform: "uppercase",
});

const StageValue = styled(Text, {
  ...typography.bodySmall,
  color: "$text",
  fontWeight: "900",
});
