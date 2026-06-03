import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SlidersHorizontal } from 'lucide-react-native';
import { usePallet } from '@features/pallets/providers/PalletProvider';
import { PaginationComponent, usePagination } from '@shared/components/Pagination';
import { PalletCard } from '../../components/PalletCard';
import { palletItems } from '../../mocks/palletMock';
import { ListScreenShell } from '../../components/ListScreenShell';

export function PalletListScreen() {
  const { setOperationPallet } = usePallet();
  const { setPaginationMeta } = usePagination();
  const listedPalletItems = [...palletItems, ...palletItems];

  useFocusEffect(
    useCallback(() => {
      setPaginationMeta({ currentPage: 1, lastPage: 1, totalItems: listedPalletItems.length });
    }, [listedPalletItems.length, setPaginationMeta]),
  );

  return (
    <ListScreenShell
      title="Paletes"
      floatActions={[
        { Icon: SlidersHorizontal, label: 'Filtros', onPress: () => setOperationPallet('exit')}
      ]}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {listedPalletItems.map((item,index) => <PalletCard key={index} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
