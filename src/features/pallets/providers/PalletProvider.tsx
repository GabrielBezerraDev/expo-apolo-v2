import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import type { ScannerCaptureResult } from '@features/scanner';
import { Alert } from 'react-native';
import { Control, ControllerProps, useForm } from 'react-hook-form';
import { FormScreenPalletType } from '../screens/form/FormScreenPallet/FormScreenPalletType';
import { zodResolver } from '@hookform/resolvers/zod';
import { formScreenPalletSchema } from '../screens/form/FormScreenPallet/FormScreenPalletSchema';

export type EntryPallet = {
  id: string;
  lot: string;
  photos: Array<string | null>;
};

export type EntryScanTarget =
  | { type: 'route' }
  | { type: 'lot'; palletIndex: number }
  | { type: 'photo'; palletIndex: number; photoIndex: number };

type PalletContextValue = {
  route: string;
  palletQuantity: string;
  pallets: EntryPallet[];
  scanTarget: EntryScanTarget | null;
  canConfirmForm: boolean;
  canConfirmPallets: boolean;
  setPalletQuantity: (value: string) => void;
  setScanTarget: (target: EntryScanTarget | null) => void;
  startPalletCapture: () => boolean;
  handleScanCapture: (result: ScannerCaptureResult) => void;
  resetEntry: () => void;
  controlFormScreenPallet: any
};

const PalletContext = createContext<PalletContextValue | undefined>(undefined);

export function PalletProvider({ children }: PropsWithChildren) {
  const [route, setRoute] = useState('');
  const [palletQuantity, setPalletQuantity] = useState('');
  const [pallets, setPallets] = useState<EntryPallet[]>([]);
  const [scanTarget, setScanTarget] = useState<EntryScanTarget | null>(null);

  const parsedQuantity = Number(palletQuantity);
  const canConfirmForm = route.trim().length > 0 && Number.isInteger(parsedQuantity) && parsedQuantity > 0;
  const canConfirmPallets = pallets.length > 0 && pallets.every(item => item.lot.trim() && item.photos.every(Boolean));

  const { control:controlFormScreenPallet } = useForm<FormScreenPalletType>({resolver: zodResolver(formScreenPalletSchema)});

  const startPalletCapture = useCallback(() => {
    if (!canConfirmForm) return false;

    setPallets(Array.from({ length: parsedQuantity }, (_, index) => ({
      id: `pallet-${index + 1}`,
      lot: '',
      photos: [null, null, null, null],
    })));

    return true;
  }, [canConfirmForm, parsedQuantity]);

  const handleScanCapture = useCallback((result: ScannerCaptureResult) => {
    Alert.alert(result.text);
  }, []);

  const resetEntry = useCallback(() => {
    setRoute('');
    setPalletQuantity('');
    setPallets([]);
    setScanTarget(null);
  }, []);

  const value = useMemo<PalletContextValue>(() => ({
    route,
    palletQuantity,
    pallets,
    scanTarget,
    canConfirmForm,
    canConfirmPallets,
    setPalletQuantity,
    setScanTarget,
    startPalletCapture,
    handleScanCapture,
    resetEntry,
    controlFormScreenPallet
  }), [
    route,
    palletQuantity,
    pallets,
    scanTarget,
    canConfirmForm,
    canConfirmPallets,
    startPalletCapture,
    handleScanCapture,
    resetEntry,
    controlFormScreenPallet
  ]);

  return <PalletContext.Provider value={value}>{children}</PalletContext.Provider>;
}

export function usePallet() {
  const context = useContext(PalletContext);

  if (!context) {
    throw new Error('usePallet must be used within a PalletProvider');
  }

  return context;
}
