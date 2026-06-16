import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, styled, Text, View } from 'tamagui';
import { AppCard } from '@shared/components/Display/AppCard';
import { useModal } from '@shared/components/Display/Modal';
import type { RootStackParamList } from '@navigation/navigation.protocol';
import { typography } from '@shared/typography';
import type { Roadmap } from '../types/roadmap';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export type OperationItem = {
  completedSteps: string;
  doneAt: string;
  id: string;
  roadmap: string;
  roadmapDetails: Roadmap;
  status: string;
  totalPallets: number;
  type: 'entry' | 'exit';
};

const HeaderRow = styled(View, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' });
const HeaderText = styled(Text, { ...typography.bodyMedium, color: '$white', fontWeight: '800' });
const Body = styled(View, { gap: 8 });
const Line = styled(Text, { ...typography.bodyMedium, color: '$text' });
const Muted = styled(Text, { ...typography.bodySmall, color: '$mutedText' });

export function OperationCard({ item }: { item: OperationItem }) {
  const { closeModal, openModal } = useModal();
  const navigation = useNavigation<Navigation>();
  const title = `${item.type === 'entry' ? 'ENTRADA' : 'SAÍDA'} FEITA: ${item.doneAt}`;

  const openPhotosScreen = useCallback(() => {
    navigation.navigate('RoadmapPhotos', { roadmap: item.roadmapDetails });
  }, [item.roadmapDetails, navigation]);

  const openOptionsModal = useCallback(() => {
    let modalId = '';
    modalId = openModal(
      <OperationOptionsModal
        onViewPhotos={() => {
          closeModal(modalId);
          openPhotosScreen();
        }}
      />,
      {
        animationType: 'slide',
        heightPercent: 26,
        maxHeightPercent: 42,
        minHeight: 0,
        title: 'Opções',
        widthPercent: 88,
      },
    );
  }, [closeModal, openModal, openPhotosScreen]);

  return (
    <AppCard
      variant="orangeHeader"
      footerConfig={{ title: 'OPÇÕES', footerCallback: openOptionsModal }}
      header={<HeaderRow><HeaderText>{title}</HeaderText></HeaderRow>}
    >
      <Body>
        <Line>{item.completedSteps}</Line>
        <Line>Roteiro: {item.roadmap}</Line>
        <Line>Status: {item.status}</Line>
        <Muted>Total de paletes: {item.totalPallets}</Muted>
      </Body>
    </AppCard>
  );
}

function OperationOptionsModal({ onViewPhotos }: { onViewPhotos: () => void }) {
  return (
    <OptionsRoot>
      <OptionButton onPress={onViewPhotos}>
        <OptionButtonText>Ver fotos</OptionButtonText>
      </OptionButton>
    </OptionsRoot>
  );
}

const OptionsRoot = styled(View, {
  gap: 12,
  justifyContent: 'center',
});

const OptionButton = styled(Button, {
  unstyled: true,
  alignItems: 'center',
  backgroundColor: '$primary',
  borderRadius: 12,
  justifyContent: 'center',
  minHeight: 46,
  paddingHorizontal: 18,
  paddingVertical: 12,
});

const OptionButtonText = styled(Text, {
  ...typography.button,
  color: '$white',
  fontWeight: '900',
  textTransform: 'uppercase',
});
