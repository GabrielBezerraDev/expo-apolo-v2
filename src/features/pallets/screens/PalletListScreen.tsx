import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { PackagePlus, Search, SlidersHorizontal } from 'lucide-react-native';
import { PalletCard } from '../components/PalletCard';
import { palletItems } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function PalletListScreen() {
  return (
    <ListScreenShell
      title="Pallets"
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {[...palletItems,...palletItems].map((item,index) => <PalletCard key={index} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
