import React, { PropsWithChildren, useCallback } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BaggageClaim, Filter } from 'lucide-react-native';
import type { RootStackParamList } from '@config/navigation.protocol';
import { PaginationComponent, usePagination } from '@shared/components/Pagination';
import { OperationCard } from '../../components/OperationCard';
import { exitOperations } from '../../mocks/palletMock';
import { ListScreenShell } from '../../components/ListScreenShell';
import { usePallet } from '../../providers/PalletProvider';
import { View } from 'tamagui';

type Navigation = NativeStackNavigationProp<RootStackParamList>;



export function ExitListScreen() {
  const navigation = useNavigation<Navigation>();
  const { resetEntry, setOperationPallet } = usePallet();
  const { setPaginationMeta } = usePagination();

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
        { Icon: Filter, label: 'Filtro', onPress: () => Alert.alert('Filtrar saídas') },
      ]}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {exitOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
