import React from 'react';
import { ScrollView } from 'react-native';
import { PalletCard } from '../components/PalletCard';
import { palletItems } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function PalletListScreen() {
  return (
    <ListScreenShell title="Pallets">
      <ScrollView contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
        {palletItems.map(item => <PalletCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
