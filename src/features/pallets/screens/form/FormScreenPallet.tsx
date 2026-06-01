import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera } from 'lucide-react-native';
import { Text, View } from 'tamagui';
import type { RootStackParamList } from '@config/navigation.protocol';
import { useThemeMode } from '@hooks/useThemeMode';
import { AppButton } from '@shared/components/AppButton';
import { AppInput } from '@shared/components/AppInput';
import { typography } from '@shared/typography';
import { usePallet } from '../../providers/PalletProvider';
import { ListScreenShell } from '../../components/ListScreenShell';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function FormScreenPallet() {
  const navigation = useNavigation<Navigation>();
  const { theme } = useThemeMode();
  const {
    route,
    palletQuantity,
    canConfirmForm,
    setPalletQuantity,
    setScanTarget,
    startPalletCapture,
    resetEntry,
  } = usePallet();

  const formSubtitle = useMemo(() => {
    if (!route) return 'Escaneie o roteiro e informe a quantidade de pallets.';
    return `Roteiro ${route}`;
  }, [route]);

  const scanRoute = () => {
    setScanTarget({ type: 'route' });
    navigation.navigate('Scanner');
  };

  const confirm = () => {
    if (startPalletCapture()) {
      navigation.navigate('PalletsEvidence');
    }
  };

  const cancel = () => {
    resetEntry();
    navigation.goBack();
  };

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
                <Pressable onPress={scanRoute} hitSlop={10}>
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
            <AppButton title="CONFIRMAR" disabled={!canConfirmForm} onPress={confirm} />
            <AppButton title="CANCELAR" variant="outline" onPress={cancel} />
          </View>
        </View>
      </View>
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
    justifyContent: 'center',
  },
  helperText: {
    ...typography.bodySmall,
  },
});
