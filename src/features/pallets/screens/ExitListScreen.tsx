import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { FileCheck2, Plus, ScanLine } from 'lucide-react-native';
import { OperationCard } from '../components/OperationCard';
import { exitOperations } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function ExitListScreen() {
  return (
    <ListScreenShell
      title="Saídas"
      floatActions={[
        { Icon: Plus, label: 'Nova saída', onPress: () => Alert.alert('Nova saída') },
        { Icon: ScanLine, label: 'Escanear', onPress: () => Alert.alert('Escanear saída') },
        { Icon: FileCheck2, label: 'Finalizar', onPress: () => Alert.alert('Finalizar saída') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {exitOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
