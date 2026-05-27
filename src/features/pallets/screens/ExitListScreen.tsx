import React from 'react';
import { ScrollView } from 'react-native';
import { OperationCard } from '../components/OperationCard';
import { exitOperations } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function ExitListScreen() {
  return (
    <ListScreenShell title="Saídas">
      <ScrollView contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
        {exitOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
