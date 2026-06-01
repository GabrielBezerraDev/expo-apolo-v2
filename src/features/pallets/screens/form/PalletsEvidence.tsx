import React from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, CheckCircle2, X } from 'lucide-react-native';
import { Text, View } from 'tamagui';
import type { RootStackParamList } from '@config/navigation.protocol';
import { useThemeMode } from '@hooks/useThemeMode';
import { AppButton } from '@shared/components/AppButton';
import { AppInput } from '@shared/components/AppInput';
import { typography } from '@shared/typography';
import { usePallet } from '../../providers/PalletProvider';
import { ListScreenShell } from '../../components/ListScreenShell';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function PalletsEvidence() {
  const navigation = useNavigation<Navigation>();
  const { theme } = useThemeMode();
  const { width } = useWindowDimensions();
  const {
    route,
    pallets,
    canConfirmPallets,
    setScanTarget,
    resetEntry,
  } = usePallet();
  const cardWidth = Math.min(width - 56, 360);
  const photoSlotWidth = cardWidth - 32;

  const scanLot = (palletIndex: number) => {
    setScanTarget({ type: 'lot', palletIndex });
    navigation.navigate('Scanner');
  };

  const scanPhoto = (palletIndex: number, photoIndex: number) => {
    setScanTarget({ type: 'photo', palletIndex, photoIndex });
    navigation.navigate('Scanner');
  };

  const closeEntry = () => {
    resetEntry();
    navigation.popToTop();
  };

  const finishEntry = () => {
    Alert.alert('Entrada concluída', `${pallets.length} pallet(s) capturados.`);
    closeEntry();
  };

  return (
    <ListScreenShell title="Captura de pallets">
      <ScrollView contentContainerStyle={styles.palletsContent} showsVerticalScrollIndicator={false}>
        <View style={styles.palletsHeader}>
          <View>
            <Text style={[styles.palletsTitle, { color: theme.text }]}>Roteiro: {route}</Text>
            <Text style={[styles.helperText, { color: theme.mutedText }]}>Preencha lote e 4 fotos de cada pallet.</Text>
          </View>
          <Pressable onPress={closeEntry} hitSlop={10}>
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
                  onPress={() => scanPhoto(palletIndex, photoIndex)}
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
                <Pressable onPress={() => scanLot(palletIndex)} hitSlop={10}>
                  <Camera size={20} color={theme.primary} />
                </Pressable>
              }
            />
          </View>
        ))}

        <AppButton title="CONFIRMAR" disabled={!canConfirmPallets} onPress={finishEntry} />
      </ScrollView>
    </ListScreenShell>
  );
}


const styles = StyleSheet.create({
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
