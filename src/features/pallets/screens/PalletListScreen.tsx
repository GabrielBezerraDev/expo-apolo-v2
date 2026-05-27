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
      floatActions={[
        { Icon: PackagePlus, label: 'Novo pallet', onPress: () => Alert.alert('Novo pallet') },
        { Icon: Search, label: 'Buscar', onPress: () => Alert.alert('Buscar pallet') },
        { Icon: SlidersHorizontal, label: 'Filtros', onPress: () => Alert.alert('Filtros') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {[...palletItems,...palletItems].map((item,index) => <PalletCard key={index} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
