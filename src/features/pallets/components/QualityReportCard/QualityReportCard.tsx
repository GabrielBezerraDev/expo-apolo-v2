import React, { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, styled, Text, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { AppCard } from "@shared/components/Display/AppCard";
import { useModal } from "@shared/components/Display/Modal";
import { typography } from "@shared/typography";
import { PalletReportType, QualityReport } from "../../protocol";
import { getPalletStageLabel } from "../../utils";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

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
  const { closeModal, openModal } = useModal();
  const navigation = useNavigation<Navigation>();
  const pallet = item.pallet ?? {};

  const openHistoryScreen = useCallback(() => {
    if (!pallet.id) return;

    navigation.navigate("PalletHistory", { batch: pallet.batch, palletId: pallet.id });
  }, [navigation, pallet.batch, pallet.id]);

  const openPhotosScreen = useCallback(() => {
    if (!pallet.id) return;

    navigation.navigate("PalletPhotos", { batch: pallet.batch, palletId: pallet.id });
  }, [navigation, pallet.batch, pallet.id]);

  const openOptionsModal = useCallback(() => {
    let modalId = "";
    modalId = openModal(
      <PalletOptionsModal
        hasPalletId={Boolean(pallet.id)}
        onViewHistory={() => {
          closeModal(modalId);
          openHistoryScreen();
        }}
        onViewPhotos={() => {
          closeModal(modalId);
          openPhotosScreen();
        }}
      />,
      {
        animationType: "slide",
        heightPercent: 30,
        maxHeightPercent: 42,
        minHeight: 0,
        title: "Opções",
        widthPercent: 88,
      },
    );
  }, [closeModal, openHistoryScreen, openModal, openPhotosScreen, pallet.id]);

  return (
    <AppCard
      variant="orangeHeader"
      footerConfig={{ title: "OPÇÕES", footerCallback: openOptionsModal }}
      header={
        <Header>
          <HeaderText>{formatDate(item.date ?? pallet.createdAt)}</HeaderText>
          <Badge>{getPalletStageLabel(pallet.currentStage)}</Badge>
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

function PalletOptionsModal({
  hasPalletId,
  onViewHistory,
  onViewPhotos,
}: {
  hasPalletId: boolean;
  onViewHistory: () => void;
  onViewPhotos: () => void;
}) {
  if (!hasPalletId) {
    return (
      <OptionsRoot>
        <UnavailableText>Palete sem identificador.</UnavailableText>
      </OptionsRoot>
    );
  }

  return (
    <OptionsRoot>
      <OptionButton onPress={onViewHistory}>
        <OptionButtonText>Histórico do Palete</OptionButtonText>
      </OptionButton>
      <OptionButton onPress={onViewPhotos}>
        <OptionButtonText>Fotos do Palete</OptionButtonText>
      </OptionButton>
    </OptionsRoot>
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

const OptionsRoot = styled(View, {
  gap: 12,
  justifyContent: "center",
});

const OptionButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "$primary",
  borderRadius: 12,
  justifyContent: "center",
  minHeight: 46,
  paddingHorizontal: 18,
  paddingVertical: 12,
});

const OptionButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
  textTransform: "uppercase",
});

const UnavailableText = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
  fontWeight: "700",
  textAlign: "center",
});
