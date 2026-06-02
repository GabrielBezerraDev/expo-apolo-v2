import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { BaggageClaim, Filter } from 'lucide-react-native';
import { OperationCard } from '../../components/OperationCard';
import { exitOperations } from '../../mocks/palletMock';
import { ListScreenShell } from '../../components/ListScreenShell';

export function ExitListScreen() {
  return (
    <ListScreenShell
      title="Saídas"
      floatActions={[
        { Icon: BaggageClaim, label: 'Nova Saída', onPress: () => Alert.alert('Nova saída') },
        { Icon: Filter, label: 'Filtro', onPress: () => Alert.alert('Filtrar saídas') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {exitOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
