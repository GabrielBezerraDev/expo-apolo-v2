import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { PalletCard } from '../../components/PalletCard';
import { palletItems } from '../../mocks/palletMock';
import { ListScreenShell } from '../../components/ListScreenShell';
import { usePallet } from '@features/pallets/providers/PalletProvider';

export function PalletListScreen() {
  const { setOperationPallet } = usePallet();
  return (
    <ListScreenShell
      title="Paletes"
      floatActions={[
        { Icon: SlidersHorizontal, label: 'Filtros', onPress: () => setOperationPallet('exit')}
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {[...palletItems,...palletItems].map((item,index) => <PalletCard key={index} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
