import React from 'react';
import { ScrollView } from 'react-native';
import { OperationCard } from '../components/OperationCard';
import { entryOperations } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function EntryListScreen() {
  return (
    <ListScreenShell title="Entradas">
      <ScrollView contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
        {entryOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
