import React from 'react';
import { styled, Text, View } from 'tamagui';
import { AppCard } from '@shared/components/Display/AppCard';
import { typography } from '@shared/typography';

export type OperationItem = {
  completedSteps: string;
  doneAt: string;
  id: string;
  roadmap: string;
  status: string;
  totalPallets: number;
  type: 'entry' | 'exit';
};

const HeaderRow = styled(View, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' });
const HeaderText = styled(Text, { ...typography.bodyMedium, color: '$white', fontWeight: '800' });
const Body = styled(View, { gap: 8 });
const Line = styled(Text, { ...typography.bodyMedium, color: '$text' });
const Muted = styled(Text, { ...typography.bodySmall, color: '$mutedText' });
const Action = styled(Text, { ...typography.button, color: '$primary', marginTop: 8 });

export function OperationCard({ item }: { item: OperationItem }) {
  const title = `${item.type === 'entry' ? 'ENTRADA' : 'SAÍDA'} FEITA: ${item.doneAt}`;

  return (
    <AppCard variant="orangeHeader" header={<HeaderRow><HeaderText>{title}</HeaderText></HeaderRow>}>
      <Body>
        <Line>{item.completedSteps}</Line>
        <Line>Roteiro: {item.roadmap}</Line>
        <Line>Status: {item.status}</Line>
        <Muted>Total de pallets: {item.totalPallets}</Muted>
        <Action>Histórico</Action>
      </Body>
    </AppCard>
  );
}
