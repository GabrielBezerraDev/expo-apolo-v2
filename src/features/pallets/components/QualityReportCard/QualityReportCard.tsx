import React from "react";
import { styled, Text, View } from "tamagui";
import { AppCard } from "@shared/components/Display/AppCard";
import { typography } from "@shared/typography";
import { PalletReportType, QualityReport } from "../../protocol";

type Props = {
  item: QualityReport;
  reportType: PalletReportType;
};

const Header = styled(View, {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
});

const HeaderText = styled(Text, {
  ...typography.bodyMedium,
  color: "$white",
  fontWeight: "800",
  flex: 1,
});

const Badge = styled(Text, {
  ...typography.label,
  color: "$primary",
  backgroundColor: "$white",
  borderRadius: 999,
  paddingVertical: 5,
  paddingHorizontal: 9,
  overflow: "hidden",
});

const Line = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  marginBottom: 7,
});

const MutedLine = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  marginTop: 2,
});

export function QualityReportCard({ item, reportType }: Props) {
  const pallet = item.pallet ?? {};

  return (
    <AppCard
      variant="orangeHeader"
      header={
        <Header>
          <HeaderText>{formatDate(item.date ?? pallet.createdAt)}</HeaderText>
          <Badge>{stageToLabel(pallet.currentStage)}</Badge>
        </Header>
      }
    >
      <Line>BATCH: {pallet.batch ?? "-"}</Line>
      <Line>Variante: {pallet.variant ?? "-"}</Line>
      <Line>Quantidade: {pallet.quantity ?? "-"}</Line>
      <Line>Linha: {pallet.lineName ?? pallet.lineId ?? "-"}</Line>
      {renderReportDetails(item, reportType)}
    </AppCard>
  );
}

function renderReportDetails(item: QualityReport, reportType: PalletReportType) {
  if (reportType === "releasedPallet") {
    return <MutedLine>Caixas: {item.firstBox ?? "-"} até {item.lastBox ?? "-"}</MutedLine>;
  }

  if (reportType === "onHoldPallet") {
    return <MutedLine>Motivo: {item.holdReason ?? item.observation ?? "-"}</MutedLine>;
  }

  return <MutedLine>Problema: {item.issue ?? "-"}</MutedLine>;
}

function formatDate(value?: string) {
  if (!value) return "Sem data";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function stageToLabel(value?: string) {
  const labels: Record<string, string> = {
    FINISHED: "Finalizado",
    PACKAGING: "Qualidade",
    PACKAGING_FOR_REVIEW: "Retorno Produção",
    PRODUCTION: "Produção",
    PRODUCTION_FOR_REVIEW: "Retorno Produção",
    STORAGE: "Expedição",
    WIP: "WIP",
    WIP_FOR_REVIEW: "Retorno Apontamento",
  };

  return value ? labels[value] ?? value : "-";
}
