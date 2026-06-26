import React, { useCallback, useMemo } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Button, ScrollView, styled, Text, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { PhotoCarousel, type PhotoCarouselItem } from "@shared/components/Display";
import { LottieAnimLoading } from "@shared/components/Feedback";
import { useAppHeaderConfig } from "@shared/components/Navigation/AppHeader";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import { primaryButtonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";
import type { PalletPhotoStage, PalletPhotosByStage, PalletStagePhoto } from "../../../protocol";
import { usePalletApi } from "../../../services";
import { resolvePalletPhotoUri } from "../../../services/roadmapPhotoStorage";
import { getPalletStageLabel, getPalletStagePhotoTitle } from "../../../utils";

type Props = NativeStackScreenProps<RootStackParamList, "PalletPhotos">;

const PHOTO_STAGE_ORDER: PalletPhotoStage[] = ["WIP", "STORAGE", "VALORLOG_ENTRY", "VALORLOG_EXIT"];

export function PalletPhotosScreen({ navigation, route }: Props) {
  const palletApi = usePalletApi();
  const canLoadPhotos = hasApiBaseUrl() && palletApi.hasAuthToken;
  const photosQuery = useQuery({
    queryKey: ["pallet-photos-by-stage", route.params.palletId],
    queryFn: () => palletApi.getPalletPhotosByStage(route.params.palletId),
    enabled: canLoadPhotos,
  });
  const response = photosQuery.data;
  const subtitle = response?.pallet.batch ?? route.params.batch;
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const stages = useMemo(() => normalizePhotoStages(response?.stages), [response?.stages]);
  const stickerItems = useMemo<PhotoCarouselItem[]>(() => [
    {
      id: "sticker",
      title: "Etiqueta do palete",
      uri: resolvePalletPhotoUri(response?.sticker?.filePath),
    },
  ], [response?.sticker?.filePath]);

  useAppHeaderConfig({
    title: "Fotos do palete",
    subtitle: subtitle ? `Lote ${subtitle}` : undefined,
    showBack: true,
    onBack: goBack,
  });

  return (
    <Screen>
      <Content>
        {photosQuery.isLoading || !canLoadPhotos ? (
          <CenteredFrame>
            {canLoadPhotos ? (
              <LottieAnimLoading label="Carregando fotos" />
            ) : (
              <ErrorText>Configure EXPO_PUBLIC_API_URL para carregar as fotos.</ErrorText>
            )}
          </CenteredFrame>
        ) : photosQuery.isError ? (
          <CenteredFrame>
            <ErrorText>{photosQuery.error.message}</ErrorText>
            <RetryButton onPress={() => { void photosQuery.refetch(); }}>
              <RetryButtonText>TENTAR NOVAMENTE</RetryButtonText>
            </RetryButton>
          </CenteredFrame>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={contentStyle}>
            <Section>
              <SectionTitle>Foto da Etiqueta do Palete (Qualidade)</SectionTitle>
              <PhotoCarousel
                emptyLabel="Foto não disponível"
                heightPreset="large"
                imageResizeMode="contain"
                items={stickerItems}
                readonly
                showItemHeader
              />
            </Section>

            {stages.map(stage => (
              <PhotoStageSection key={stage.stage} stage={stage} />
            ))}
          </ScrollView>
        )}
      </Content>
    </Screen>
  );
}

function PhotoStageSection({ stage }: { stage: PalletPhotosByStage }) {
  const items = buildPhotoItems(stage);

  return (
    <Section>
      <SectionTitle>{getPalletStagePhotoTitle(stage.stage)}</SectionTitle>
      <SectionSubtitle>{stage.label}</SectionSubtitle>
      <PhotoCarousel
        emptyLabel="Nenhuma foto disponível"
        heightPreset="large"
        imageResizeMode="contain"
        items={items}
        readonly
        showItemHeader
      />
    </Section>
  );
}

function buildPhotoItems(stage: PalletPhotosByStage): PhotoCarouselItem[] {
  if (!stage.photos.length) {
    return [{ id: `${stage.stage}-empty`, title: stage.label, uri: null }];
  }

  return stage.photos.map((photo, index) => ({
    id: String(photo.id ?? `${stage.stage}-${index}`),
    subtitle: buildPhotoSubtitle(photo, index, stage.photos.length),
    title: stage.label,
    uri: resolvePalletPhotoUri(photo.filePath),
  }));
}

function buildPhotoSubtitle(photo: PalletStagePhoto, index: number, total: number) {
  const baseLabel = `Foto ${index + 1}/${total}`;
  if (photo.roadmap) return `${baseLabel} - Roteiro ${photo.roadmap}`;
  return baseLabel;
}

function normalizePhotoStages(stages: PalletPhotosByStage[] = []) {
  const stagesByName = new Map<PalletPhotoStage, PalletPhotosByStage>(
    PHOTO_STAGE_ORDER.map(stage => [stage, {
      label: getPalletStageLabel(stage),
      photos: [],
      stage,
    }]),
  );

  stages.forEach(section => {
    section.photos.forEach(photo => {
      const targetStage = getStageFromPalletImagePath(photo.filePath) ?? section.stage;
      const targetSection = stagesByName.get(targetStage);
      if (!targetSection) return;

      targetSection.photos.push({ ...photo, stage: targetStage });
    });
  });

  return PHOTO_STAGE_ORDER.map(stage => stagesByName.get(stage)).filter(Boolean) as PalletPhotosByStage[];
}

function getStageFromPalletImagePath(filePath: string): PalletPhotoStage | null {
  const reportFolder = filePath.match(/(?:^|\/)report\/([^/]+)/)?.[1];

  if (reportFolder === "1") return "WIP";
  if (reportFolder === "2") return "STORAGE";

  return null;
}

const contentStyle = {
  gap: 14,
  paddingBottom: 28,
  paddingTop: 14,
};

const Screen = styled(View, {
  backgroundColor: "$background",
  flex: 1,
});

const Content = styled(View, {
  flex: 1,
  paddingHorizontal: 12,
});

const CenteredFrame = styled(View, {
  alignItems: "center",
  flex: 1,
  gap: 14,
  justifyContent: "center",
});

const Section = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  gap: 10,
  padding: 12,
});

const SectionTitle = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "800",
});

const SectionSubtitle = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
});

const ErrorText = styled(Text, {
  ...typography.bodyMedium,
  color: "$error",
  fontWeight: "700",
  textAlign: "center",
});

const RetryButton = styled(Button, {
  alignItems: "center",
  backgroundColor: "$primary",
  borderRadius: 12,
  justifyContent: "center",
  minHeight: 46,
  paddingHorizontal: 18,
  paddingVertical: 12,
  pressStyle: primaryButtonPressStyle,
});

const RetryButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
});
