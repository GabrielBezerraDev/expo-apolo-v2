import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';
import type { ScannerCaptureResult } from '@features/scanner';

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
    const target = scanTarget;
    const value = result.text?.trim() || '';

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
  }, [scanTarget]);

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
