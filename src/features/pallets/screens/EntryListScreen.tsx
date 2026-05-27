import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { ClipboardCheck, ClipboardPlus, Filter, Plus, ScanLine } from 'lucide-react-native';
import { OperationCard } from '../components/OperationCard';
import { entryOperations } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function EntryListScreen() {
  return (
    <ListScreenShell
      title="Entradas"
      floatActions={[
        { Icon: ClipboardPlus, label: 'Nova entrada', onPress: () => Alert.alert('Nova entrada') },
        { Icon: Filter, label: 'Filtro', onPress: () => Alert.alert('Escanear entrada') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {entryOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
