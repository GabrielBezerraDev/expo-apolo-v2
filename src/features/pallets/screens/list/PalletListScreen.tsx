import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { PackagePlus, ScanLine, SlidersHorizontal } from 'lucide-react-native';
import { FramedCameraScanner, ScannerCaptureResult } from '@features/scanner';
import { PalletCard } from '../../components/PalletCard';
import { palletItems } from '../../mocks/palletMock';
import { ListScreenShell } from '../../components/ListScreenShell';

export function PalletListScreen() {

  return (
    <ListScreenShell
      title="Paletes"
      floatActions={[
        { Icon: SlidersHorizontal, label: 'Filtros', onPress: () => Alert.alert('Filtros') }
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {[...palletItems,...palletItems].map((item,index) => <PalletCard key={index} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}
