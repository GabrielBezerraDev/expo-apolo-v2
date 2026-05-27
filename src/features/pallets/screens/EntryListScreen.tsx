import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { ClipboardCheck, Plus, ScanLine } from 'lucide-react-native';
import { OperationCard } from '../components/OperationCard';
import { entryOperations } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function EntryListScreen() {
  return (
    <ListScreenShell
      title="Entradas"
      floatActions={[
        { Icon: Plus, label: 'Nova entrada', onPress: () => Alert.alert('Nova entrada') },
        { Icon: ScanLine, label: 'Escanear', onPress: () => Alert.alert('Escanear entrada') },
        { Icon: ClipboardCheck, label: 'Conferir', onPress: () => Alert.alert('Conferir entradas') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {entryOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
