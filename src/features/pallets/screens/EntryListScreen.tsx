import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { ClipboardPlus, Filter, ScanLine } from 'lucide-react-native';
import { FramedCameraScanner, ScannerCaptureResult } from '@features/scanner';
import { OperationCard } from '../components/OperationCard';
import { entryOperations } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function EntryListScreen() {
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleCapture = (result: ScannerCaptureResult) => {
    setScannerOpen(false);
    Alert.alert('Etiqueta escaneada', result.text || 'Imagem recortada. OCR nativo ainda não disponível neste build.');
  };

  if (scannerOpen) {
    return (
      <FramedCameraScanner
        preset="singleField"
        title="Escanear entrada"
        description="Alinhe o campo da etiqueta dentro da moldura."
        onCancel={() => setScannerOpen(false)}
        onCapture={handleCapture}
      />
    );
  }

  return (
    <ListScreenShell
      title="Entradas"
      floatActions={[
        { Icon: ClipboardPlus, label: 'Nova entrada', onPress: () => Alert.alert('Nova entrada') },
        { Icon: ScanLine, label: 'Escanear', onPress: () => setScannerOpen(true) },
        { Icon: Filter, label: 'Filtro', onPress: () => Alert.alert('Filtrar entradas') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {entryOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
