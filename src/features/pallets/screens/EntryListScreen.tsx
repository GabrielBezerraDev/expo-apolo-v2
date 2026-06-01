import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Camera, CheckCircle2, ClipboardPlus, Filter, ScanLine, X } from 'lucide-react-native';
import { Text, View } from 'tamagui';
import { FramedCameraScanner, ScannerCaptureResult } from '@features/scanner';
import { useThemeMode } from '@hooks/useThemeMode';
import { AppButton } from '@shared/components/AppButton';
import { AppInput } from '@shared/components/AppInput';
import { typography } from '@shared/typography';
import { OperationCard } from '../components/OperationCard';
import { entryOperations } from '../mocks/palletMock';
import { ListScreenShell } from './ListScreenShell';

type EntryStep = 'list' | 'form' | 'pallets';
type ScanTarget =
  | { type: 'route' }
  | { type: 'lot'; palletIndex: number }
  | { type: 'photo'; palletIndex: number; photoIndex: number };

type EntryPallet = {
  id: string;
  lot: string;
  photos: Array<string | null>;
};

export function EntryListScreen() {
  const { theme } = useThemeMode();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState<EntryStep>('list');
  const [scanTarget, setScanTarget] = useState<ScanTarget | null>(null);
  const [route, setRoute] = useState('');
  const [palletQuantity, setPalletQuantity] = useState('');
  const [pallets, setPallets] = useState<EntryPallet[]>([]);

  const parsedQuantity = Number(palletQuantity);
  const canConfirmForm = route.trim().length > 0 && Number.isInteger(parsedQuantity) && parsedQuantity > 0;
  const canConfirmPallets = pallets.length > 0 && pallets.every(item => item.lot.trim() && item.photos.every(Boolean));
  const cardWidth = Math.min(width - 56, 360);
  const photoSlotWidth = cardWidth - 32;

  const formSubtitle = useMemo(() => {
    if (!route) return 'Escaneie o roteiro e informe a quantidade de pallets.';
    return `Roteiro ${route}`;
  }, [route]);

  const handleCapture = (result: ScannerCaptureResult) => {
    const target = scanTarget;
    const value = result.text?.trim() || ``;

    setScanTarget(null);

    if (!target) return;

    if (target.type === 'route') {
      setRoute(value);
      return;
    }

    if (target.type === 'lot') {
      setPallets(current => current.map((item, index) => (
        index === target.palletIndex ? { ...item, lot: value } : item
      )));
      return;
    }

    setPallets(current => current.map((item, index) => {
      if (index !== target.palletIndex) return item;

      const photos = [...item.photos];
      photos[target.photoIndex] = result.imageUri;
      return { ...item, photos };
    }));
  };

  const startPalletCapture = () => {
    if (!canConfirmForm) return;

    setPallets(Array.from({ length: parsedQuantity }, (_, index) => ({
      id: `pallet-${index + 1}`,
      lot: '',
      photos: [null, null, null, null],
    })));
    setStep('pallets');
  };

  const resetEntry = () => {
    setRoute('');
    setPalletQuantity('');
    setPallets([]);
    setStep('list');
  };

  if (scanTarget) {
    const isPhoto = scanTarget.type === 'photo';

    return (
      <FramedCameraScanner
        onCancel={() => setScanTarget(null)}
        onCapture={handleCapture}
        preset='tinyData'
      />
    );
  }

  if (step === 'form') {
    return (
      <ListScreenShell title="Nova entrada">
        <View style={styles.formScreen}>
          <View style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.card }]}> 
            <View style={[styles.panelHeader, { backgroundColor: theme.primary }]}> 
              <Text style={styles.panelHeaderText}>NOVA ENTRADA</Text>
            </View>
            <View style={styles.formBody}>
              <Text style={[styles.helperText, { color: theme.mutedText }]}>{formSubtitle}</Text>
              <AppInput
                label="Roteiro"
                value={route}
                editable={false}
                placeholder="Escaneie o roteiro"
                rightIcon={
                  <Pressable onPress={() => setScanTarget({ type: 'route' })} hitSlop={10}>
                    <Camera size={20} color={theme.primary} />
                  </Pressable>
                }
              />
              <AppInput
                label="Quan. de pallets"
                value={palletQuantity}
                onChangeText={value => setPalletQuantity(value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="Ex: 2"
              />
              <AppButton title="CONFIRMAR" disabled={!canConfirmForm} onPress={startPalletCapture} />
              <AppButton title="CANCELAR" variant="outline" onPress={resetEntry} />
            </View>
          </View>
        </View>
      </ListScreenShell>
    );
  }

  if (step === 'pallets') {
    return (
      <ListScreenShell title="Captura de pallets">
        <ScrollView contentContainerStyle={styles.palletsContent} showsVerticalScrollIndicator={false}>
          <View style={styles.palletsHeader}>
            <View>
              <Text style={[styles.palletsTitle, { color: theme.text }]}>Roteiro: {route}</Text>
              <Text style={[styles.helperText, { color: theme.mutedText }]}>Preencha lote e 4 fotos de cada pallet.</Text>
            </View>
            <Pressable onPress={resetEntry} hitSlop={10}>
              <X size={24} color={theme.mutedText} />
            </Pressable>
          </View>

          {pallets.map((pallet, palletIndex) => (
            <View key={pallet.id} style={[styles.palletCard, { width: cardWidth, borderColor: theme.border, backgroundColor: theme.card }]}> 
              <View style={styles.palletCardHeader}>
                <Text style={[styles.palletCardTitle, { color: theme.text }]}>Pallet {palletIndex + 1}/{pallets.length}</Text>
                {pallet.lot && pallet.photos.every(Boolean) ? <CheckCircle2 size={20} color={theme.primary} /> : null}
              </View>
              <FlatList
                horizontal
                pagingEnabled
                data={pallet.photos}
                keyExtractor={(_, photoIndex) => `${pallet.id}-${photoIndex}`}
                showsHorizontalScrollIndicator={false}
                style={{ width: photoSlotWidth }}
                renderItem={({ item, index: photoIndex }) => (
                  <Pressable
                    onPress={() => setScanTarget({ type: 'photo', palletIndex, photoIndex })}
                    style={[styles.photoSlot, { width: photoSlotWidth, borderColor: theme.border, backgroundColor: theme.background }]}
                  >
                    {item ? (
                      <Image source={{ uri: item }} style={styles.photo} resizeMode="cover" />
                    ) : (
                      <View style={styles.photoEmpty}>
                        <Camera size={30} color={theme.primary} />
                        <Text style={[styles.photoCounter, { color: theme.text }]}>{photoIndex + 1}/4</Text>
                        <Text style={[styles.helperText, { color: theme.mutedText }]}>Toque para fotografar</Text>
                      </View>
                    )}
                  </Pressable>
                )}
              />
              <AppInput
                label="Escanear lote"
                value={pallet.lot}
                editable={false}
                placeholder="Escaneie o lote"
                rightIcon={
                  <Pressable onPress={() => setScanTarget({ type: 'lot', palletIndex })} hitSlop={10}>
                    <Camera size={20} color={theme.primary} />
                  </Pressable>
                }
              />
            </View>
          ))}

          <AppButton
            title="CONFIRMAR"
            disabled={!canConfirmPallets}
            onPress={() => {
              Alert.alert('Entrada concluída', `${pallets.length} pallet(s) capturados.`);
              resetEntry();
            }}
          />
        </ScrollView>
      </ListScreenShell>
    );
  }

  return (
    <ListScreenShell
      title="Entradas"
      floatActions={[
        { Icon: ClipboardPlus, label: 'Nova entrada', onPress: () => setStep('form') },
        { Icon: Filter, label: 'Filtro', onPress: () => Alert.alert('Filtrar entradas') },
      ]}
    >
      <ScrollView contentContainerStyle={{ gap: 14, paddingVertical:20 }} showsVerticalScrollIndicator={false}>
        {entryOperations.map(item => <OperationCard key={item.id} item={item} />)}
      </ScrollView>
    </ListScreenShell>
  );
}

const styles = StyleSheet.create({
  formScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    width: '100%',
    maxWidth: 560,
    minHeight: 560,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  panelHeader: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelHeaderText: {
    ...typography.button,
    color: '#ffffff',
  },
  formBody: {
    padding: 18,
    paddingTop: 48,
    gap: 16,
    justifyContent:'center',
  },
  helperText: {
    ...typography.bodySmall,
  },
  palletsContent: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    paddingBottom: 36,
  },
  palletsHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  palletsTitle: {
    ...typography.headingSmall,
  },
  palletCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  palletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  palletCardTitle: {
    ...typography.bodyLarge,
    fontWeight: '800',
  },
  photoSlot: {
    height: 210,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoCounter: {
    fontSize: 42,
    fontWeight: '900',
  },
});
