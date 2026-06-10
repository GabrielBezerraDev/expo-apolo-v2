import React from "react";
import { FlatList } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Image, ScrollView, styled, Text, useWindowDimensions, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { LottieAnimLoading } from "@shared/components/Feedback";
import { AppButton } from "@shared/components/Forms/AppButton";
import { typography } from "@shared/typography";
import type { OfflinePalletOperation } from "../../../types/offlinePalletOperation";
import { ListScreenShell } from "../../../components/ListScreenShell";
import { usePalletOperationSummary } from "./usePalletOperationSummary";

type Props = NativeStackScreenProps<RootStackParamList, "PalletOperationSummary">;
const PALLET_EVIDENCE_SECTION_TITLE = "Evidências dos paletes";
const PHOTOS_PER_PALLET = 4;

export function PalletOperationSummary({ navigation, route }: Props) {
  const { continueDraft, deleteDraft, isLoading, operation, summary } = usePalletOperationSummary({
    navigation,
    operationId: route.params.operationId,
  });
  const { width } = useWindowDimensions();
  const readonlyCarouselWidth = Math.max(240, Math.min(width - 96, 480));

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
            {section.title === PALLET_EVIDENCE_SECTION_TITLE ? (
              <ReadonlyPalletEvidence operation={operation} carouselWidth={readonlyCarouselWidth} />
            ) : (
              section.items.map((item, index) => (
                <SummaryItem key={`${item.label}-${index}`}>
                  {item.thumbnailUri ? <Thumbnail src={item.thumbnailUri} /> : null}
                  <ItemBody>
                    <ItemLabel>{item.label}</ItemLabel>
                    <ItemValue status={item.status}>{item.value}</ItemValue>
                  </ItemBody>
                </SummaryItem>
              ))
            )}
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

function ReadonlyPalletEvidence({
  carouselWidth,
  operation,
}: {
  carouselWidth: number;
  operation: OfflinePalletOperation;
}) {
  const { width } = useWindowDimensions();
  const quantity = Number(operation.formData?.palletsQuantity ?? 0);
  const pallets = operation.palletEvidenceData?.pallets ?? [];
  const expectedPallets = Number.isInteger(quantity) && quantity > 0 ? quantity : pallets.length;

  if (expectedPallets === 0) {
    return (
      <SummaryItem>
        <ItemBody>
          <ItemLabel>Paletes</ItemLabel>
          <ItemValue status="not_started">Nenhum palete informado</ItemValue>
        </ItemBody>
      </SummaryItem>
    );
  }

  return (
    <ReadonlyPalletList>
      {Array.from({ length: expectedPallets }, (_, palletIndex) => {
        const pallet = pallets.find(item => item.palletIndex === palletIndex);
        const photos = buildReadonlyPhotoSlots(pallet?.photos);

        return (
          <ReadonlyPalletCard key={`palete-${palletIndex}`}>
            <ReadonlyPalletHeader>
              <ReadonlyPalletTitle>
                Palete {palletIndex + 1}/{expectedPallets}
              </ReadonlyPalletTitle>
              <ReadonlyPalletBatch>
                Lote: {pallet?.batch || "Pendente"}
              </ReadonlyPalletBatch>
            </ReadonlyPalletHeader>
            <FlatList
              horizontal
              pagingEnabled
              data={photos}
              keyExtractor={(_, photoIndex) => `${palletIndex}-${photoIndex}`}
              showsHorizontalScrollIndicator={false}
              style={{ width: width * 0.93, height: 580 }}
              renderItem={({ item, index: photoIndex }) => (
                <ReadonlyPhotoSlot width={width * 0.93} height={580}>
                  {item ? (
                    <ReadonlyPhotoImage src={item} />
                  ) : (
                    <ReadonlyPhotoEmpty>
                      <ReadonlyPhotoCounter>{photoIndex + 1}/4</ReadonlyPhotoCounter>
                      <ReadonlyPhotoLabel>Foto pendente</ReadonlyPhotoLabel>
                    </ReadonlyPhotoEmpty>
                  )}
                </ReadonlyPhotoSlot>
              )}
            />
          </ReadonlyPalletCard>
        );
      })}
    </ReadonlyPalletList>
  );
}

function buildReadonlyPhotoSlots(photos: string[] = []) {
  return Array.from({ length: PHOTOS_PER_PALLET }, (_, index) => photos[index] ?? "");
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
  height: 20,
  width: 20,
});

const ReadonlyPalletList = styled(View, {
  gap: 14,
});

const ReadonlyPalletCard = styled(View, {
  borderTopColor: "$border",
  borderTopWidth: 1,
  gap: 10,
  paddingTop: 12,
});

const ReadonlyPalletHeader = styled(View, {
  gap: 2,
});

const ReadonlyPalletTitle = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "800",
});

const ReadonlyPalletBatch = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

const ReadonlyPhotoSlot = styled(View, {
  backgroundColor: "$background",
  borderColor: "$border",
  borderRadius: 14,
  borderWidth: 1,
  overflow: "hidden",
});

const ReadonlyPhotoImage = styled(Image, {
  height: "100%",
  width: "100%",
});

const ReadonlyPhotoEmpty = styled(View, {
  alignItems: "center",
  flex: 1,
  gap: 6,
  justifyContent: "center",
});

const ReadonlyPhotoCounter = styled(Text, {
  color: "$mutedText",
  fontSize: 34,
  fontWeight: "900",
});

const ReadonlyPhotoLabel = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
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
