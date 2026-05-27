import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { BaggageClaim, Filter, ScanLine } from 'lucide-react-native';
import { FramedCameraScanner, ScannerCaptureResult } from '@features/scanner';
import { OperationCard } from '../components/OperationCard';
import { exitOperations } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function ExitListScreen() {
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleCapture = (result: ScannerCaptureResult) => {
    setScannerOpen(false);
    Alert.alert('Etiqueta escaneada', result.text || 'Imagem recortada. OCR nativo ainda não disponível neste build.');
  };

  if (scannerOpen) {
    return (
      <FramedCameraScanner
        preset="singleField"
        title="Escanear saída"
        description="Alinhe o campo da etiqueta dentro da moldura."
        onCancel={() => setScannerOpen(false)}
        onCapture={handleCapture}
      />
    );
  }

  return (
    <ListScreenShell
      title="Saídas"
      floatActions={[
        { Icon: BaggageClaim, label: 'Nova Saída', onPress: () => Alert.alert('Nova saída') },
        { Icon: ScanLine, label: 'Escanear', onPress: () => setScannerOpen(true) },
        { Icon: Filter, label: 'Filtro', onPress: () => Alert.alert('Filtrar saídas') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {exitOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
