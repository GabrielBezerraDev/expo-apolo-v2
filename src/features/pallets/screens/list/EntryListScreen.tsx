import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClipboardPlus, Filter } from 'lucide-react-native';
import type { RootStackParamList } from '@config/navigation.protocol';
import { usePallet } from '../../providers/PalletProvider';
import { OperationCard } from '../../components/OperationCard';
import { entryOperations } from '../../mocks/palletMock';
import { ListScreenShell } from '../../components/ListScreenShell';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function EntryListScreen() {
  const navigation = useNavigation<Navigation>();
  const { resetEntry, setOperationPallet } = usePallet();

  const startEntry = () => {
    resetEntry();
    setOperationPallet('entry');
    navigation.navigate('FormScreenPallet');
  };

  return (
    <ListScreenShell
      title="Entradas"
      floatActions={[
        { Icon: ClipboardPlus, label: 'Nova entrada', onPress: startEntry },
        { Icon: Filter, label: 'Filtro', onPress: () => Alert.alert('Filtrar entradas') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical: 20 }} showsVerticalScrollIndicator={false}>
        {entryOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
