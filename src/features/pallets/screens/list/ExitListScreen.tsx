import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BaggageClaim, Filter } from 'lucide-react-native';
import type { RootStackParamList } from '@navigation/navigation.protocol';
import { PaginationComponent, usePagination } from '@shared/components/Navigation/Pagination';
import { FilterChips } from '@shared/components/Filters';
import { OperationCard } from '../../components/OperationCard';
import { exitOperations } from '../../mocks/palletMock';
import { ListScreenShell } from '../../components/ListScreenShell';
import { usePallet } from '../../providers/PalletProvider';
import { WrapperPagination } from '@shared/components/Navigation/Pagination';
import { useOperationListFilters } from '../../hooks/useOperationListFilters';

type Navigation = NativeStackNavigationProp<RootStackParamList>;



export function ExitListScreen() {
  const navigation = useNavigation<Navigation>();
  const { resetEntry, setOperationPallet } = usePallet();
  const { setPaginationMeta } = usePagination();
  const {
    chips,
    openFilterModal,
  } = useOperationListFilters({ data: exitOperations, modalTitle: 'Filtrar saídas' });

  useFocusEffect(
    useCallback(() => {
      setPaginationMeta({ currentPage: 1, lastPage: 1, totalItems: exitOperations.length });
    }, [setPaginationMeta]),
  );

  const startExit = () => {
    resetEntry();
    setOperationPallet('exit');
    navigation.navigate('FormScreenPallet');
  };

  return (
    <ListScreenShell
      title="Saídas"
      floatActions={[
        { Icon: BaggageClaim, label: 'Nova Saída', onPress: startExit },
        { Icon: Filter, label: 'Filtro', onPress: openFilterModal },
      ]}
    >
      <FilterChips chips={chips} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {exitOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
         <WrapperPagination>
              <PaginationComponent />
            </WrapperPagination>
    </ListScreenShell>
  );
}
