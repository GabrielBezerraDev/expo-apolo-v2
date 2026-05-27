import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { PackagePlus, ScanLine, SlidersHorizontal } from 'lucide-react-native';
import { FramedCameraScanner, ScannerCaptureResult } from '@features/scanner';
import { PalletCard } from '../components/PalletCard';
import { palletItems } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

export function PalletListScreen() {
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleCapture = (result: ScannerCaptureResult) => {
    setScannerOpen(false);
    Alert.alert('Etiqueta escaneada', result.text || 'Imagem recortada. OCR nativo ainda não disponível neste build.');
  };

  if (scannerOpen) {
    return (
      <FramedCameraScanner
        preset="singleField"
        title="Escanear pallet"
        description="Centralize o campo da etiqueta que deve ser lido."
        onCancel={() => setScannerOpen(false)}
        onCapture={handleCapture}
      />
    );
  }

  return (
    <ListScreenShell
      title="Pallets"
      floatActions={[
        { Icon: PackagePlus, label: 'Novo pallet', onPress: () => Alert.alert('Novo pallet') },
        { Icon: ScanLine, label: 'Escanear', onPress: () => setScannerOpen(true) },
        { Icon: SlidersHorizontal, label: 'Filtros', onPress: () => Alert.alert('Filtros') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {[...palletItems,...palletItems].map((item,index) => <PalletCard key={index} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
