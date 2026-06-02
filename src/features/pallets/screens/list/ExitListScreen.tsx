import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BaggageClaim, Filter } from 'lucide-react-native';
import type { RootStackParamList } from '@config/navigation.protocol';
import { OperationCard } from '../../components/OperationCard';
import { exitOperations } from '../../mocks/palletMock';
import { ListScreenShell } from '../../components/ListScreenShell';
import { usePallet } from '../../providers/PalletProvider';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function ExitListScreen() {
  const navigation = useNavigation<Navigation>();
  const { resetEntry, setOperationPallet } = usePallet();

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
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {exitOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
