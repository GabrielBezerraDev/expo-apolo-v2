import React, { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react-native";
import { Button, styled, Text, View } from "tamagui";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { PhotoCarousel } from "@shared/components/Display";
import { AppInput } from "@shared/components/Forms/AppInput";
import { typography } from "@shared/typography";
import { resolveRoadmapPhotoUri } from "../../services/roadmapPhotoStorage";
import type { Roadmap, RoadmapPalletPhotos } from "../../types/roadmap";

type Props = {
  roadmap: Roadmap;
};

export function RoadmapPhotosContent({ roadmap }: Props) {
  const { theme } = useThemeMode();
  const [batchSearch, setBatchSearch] = useState("");
  const deferredBatchSearch = useDeferredValue(batchSearch.trim().toLowerCase());
  const palletPhotos = useMemo(() => normalizePalletPhotos(roadmap.photosPallets), [roadmap.photosPallets]);
  const filteredPalletPhotos = useMemo(
    () => palletPhotos.filter(pallet => pallet.batch.toLowerCase().includes(deferredBatchSearch)),
    [deferredBatchSearch, palletPhotos],
  );
  const exitEvidenceItems = useMemo(() => buildExitEvidenceItems(roadmap), [roadmap]);
  const showExitEvidence = roadmap.typeRoadmap === "EXIT" && exitEvidenceItems.length > 0 && !deferredBatchSearch;

  return (
    <Root>
      <SummaryText>Roteiro: {roadmap.roadmap}</SummaryText>
      <AppInput
        value={batchSearch}
        onChangeText={setBatchSearch}
        placeholder="Buscar por lote..."
        autoCapitalize="characters"
        leftIcon={<Search size={22} color={theme.primary} />}
        rightIcon={
          batchSearch ? (
            <IconButton onPress={() => setBatchSearch("")} hitSlop={10}>
              <X size={22} color={theme.primary} />
            </IconButton>
          ) : null
        }
      />

      {showExitEvidence ? (
        <Section>
          <SectionTitle>Fotos da saída</SectionTitle>
          <PhotoCarousel
            emptyLabel="Foto não disponível"
            heightPreset="medium"
            items={exitEvidenceItems}
            readonly
            showItemHeader
          />
        </Section>
      ) : null}

      {filteredPalletPhotos.length > 0 ? (
        filteredPalletPhotos.map((pallet, index) => (
          <Section key={`${pallet.batch}-${pallet.palletIndex ?? index}`}>
            <SectionTitle>{buildPalletTitle(pallet, index)}</SectionTitle>
            <PhotoCarousel
              emptyLabel="Foto não disponível"
              heightPreset="large"
              items={Array.from({ length: 4 }, (_, photoIndex) => ({
                id: `${pallet.batch}-${photoIndex}`,
                subtitle: `Foto ${photoIndex + 1}/4`,
                title: ``,
                uri: resolveRoadmapPhotoUri(pallet.photos[photoIndex]),
              }))}
              readonly
              showItemHeader
            />
          </Section>
        ))
      ) : (
        <EmptyText>Nenhum palete encontrado para o lote informado.</EmptyText>
      )}
    </Root>
  );
}

function normalizePalletPhotos(value: Roadmap["photosPallets"]): RoadmapPalletPhotos[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is RoadmapPalletPhotos => Boolean(item?.batch && Array.isArray(item.photos)))
    .map(item => ({
      ...item,
      photos: item.photos,
    }))
    .sort((current, next) => (current.palletIndex ?? 0) - (next.palletIndex ?? 0));
}

function buildExitEvidenceItems(roadmap: Roadmap) {
  const photos = roadmap.exitEvidencePhotos;
  if (!photos) return [];

  return [
    {
      id: "truck",
      subtitle: "Foto 1/3",
      title: "Mercadoria no embarque",
      uri: resolveRoadmapPhotoUri(photos.truck),
    },
    {
      id: "licensePlate",
      subtitle: "Foto 2/3",
      title: "Placa do caminhão",
      uri: resolveRoadmapPhotoUri(photos.licensePlate),
    },
    {
      id: "seal",
      subtitle: "Foto 3/3",
      title: "Lacre do caminhão",
      uri: resolveRoadmapPhotoUri(photos.seal),
    },
  ].filter(item => Boolean(item.uri));
}

function buildPalletTitle(pallet: RoadmapPalletPhotos, index: number) {
  return `Lote ${pallet.batch}`;
}

const Root = styled(View, {
  gap: 16,
  paddingBottom: 10,
});

const SummaryText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "800",
});

const WarningText = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
  fontWeight: "700",
});

const Section = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  gap: 12,
  padding: 12,
});

const SectionTitle = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "800",
});

const EmptyText = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
  fontWeight: "700",
  textAlign: "center",
});

const IconButton = styled(Button, {
  unstyled: true,
});
