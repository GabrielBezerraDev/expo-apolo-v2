import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { Control, UseFormGetValues, UseFormSetValue, useForm } from "react-hook-form";
import { FormScreenPalletType } from "../screens/form/FormScreenPallet/FormScreenPalletType";
import { zodResolver } from "@hookform/resolvers/zod";
import { formScreenPalletSchema } from "../screens/form/FormScreenPallet/FormScreenPalletSchema";
import { OfflinePalletOperation } from "../protocol";

export type EntryPallet = {
  id: string;
  lot: string;
  photos: Array<string | null>;
};

export type EntryScanTarget =
  | { type: "route" }
  | { type: "lot"; palletIndex: number }
  | { type: "photo"; palletIndex: number; photoIndex: number };

export type ShipGoodsPhotos = {
  truck: string | null;
};

export type ExitExtraEvidencePhotos = {
  licensePlate: string | null;
  seal: string | null;
};

export type PalletEvidenceItem = {
  batch: string;
  photos: string[];
};

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
  resetEntry: () => void;
  controlFormScreenPallet: Control<FormScreenPalletType>;
  isValidFormScreenPalletValue: boolean;
  setFormScreenPalletValue: UseFormSetValue<FormScreenPalletType>;
  getValeusScreenPallet: UseFormGetValues<FormScreenPalletType>;
  operationPallet: OperationPallet;
  setOperationPallet: Dispatch<SetStateAction<OperationPallet>>;
  offlineOperationId: string | null;
  setOfflineOperationId: Dispatch<SetStateAction<string | null>>;
  palletEvidence: PalletEvidenceItem[];
  setPalletEvidence: Dispatch<SetStateAction<PalletEvidenceItem[]>>;
  shipGoodsPhotos: ShipGoodsPhotos;
  setShipGoodsPhotos: Dispatch<SetStateAction<ShipGoodsPhotos>>;
  exitExtraEvidencePhotos: ExitExtraEvidencePhotos;
  setExitExtraEvidencePhotos: Dispatch<SetStateAction<ExitExtraEvidencePhotos>>;
  hydrateOfflineOperation: (operation: OfflinePalletOperation) => void;
};

export type OperationPallet = 'entry' | 'exit';

const PalletContext = createContext<PalletContextValue | undefined>(undefined);

const initialShipGoodsPhotos: ShipGoodsPhotos = {
  truck: null,
};

const initialExitExtraEvidencePhotos: ExitExtraEvidencePhotos = {
  licensePlate: null,
  seal: null,
};

export function PalletProvider({ children }: PropsWithChildren) {
  const [route, setRoute] = useState("");
  const [palletQuantity, setPalletQuantity] = useState("");
  const [pallets, setPallets] = useState<EntryPallet[]>([]);
  const [palletEvidence, setPalletEvidence] = useState<PalletEvidenceItem[]>([]);
  const [scanTarget, setScanTarget] = useState<EntryScanTarget | null>(null);
  const [operationPallet, setOperationPallet] =  useState<OperationPallet>('entry');
  const [offlineOperationId, setOfflineOperationId] = useState<string | null>(null);
  const [shipGoodsPhotos, setShipGoodsPhotos] = useState<ShipGoodsPhotos>(initialShipGoodsPhotos);
  const [exitExtraEvidencePhotos, setExitExtraEvidencePhotos] = useState<ExitExtraEvidencePhotos>(initialExitExtraEvidencePhotos);
  const parsedQuantity = Number(palletQuantity);
  const canConfirmForm =
    route.trim().length > 0 &&
    Number.isInteger(parsedQuantity) &&
    parsedQuantity > 0;
  const canConfirmPallets =
    pallets.length > 0 &&
    pallets.every((item) => item.lot.trim() && item.photos.every(Boolean));

  const {
    control: controlFormScreenPallet,
    reset: resetFormScreenPallet,
    setValue: setFormScreenPalletValue,
    getValues: getValeusScreenPallet,
    formState: { isValid: isValidFormScreenPalletValue },
  } = useForm<FormScreenPalletType>({
    defaultValues: {
      roadmap: "",
      palletsQuantity: "",
    },
    mode: "onChange",
    resolver: zodResolver(formScreenPalletSchema),
  });

  const updatePalletQuantity = useCallback(
    (value: string) => {
      setPalletQuantity(value);
      setFormScreenPalletValue("palletsQuantity", value, {
        shouldValidate: true,
      });
    },
    [setFormScreenPalletValue],
  );

  const startPalletCapture = useCallback(() => {
    const currentRoute = getValeusScreenPallet("roadmap").trim();
    const currentQuantity = Number(getValeusScreenPallet("palletsQuantity"));

    if (!currentRoute || !Number.isInteger(currentQuantity) || currentQuantity <= 0) return false;

    setRoute(currentRoute);
    setPalletQuantity(String(currentQuantity));

    setPallets(
      Array.from({ length: currentQuantity }, (_, index) => ({
        id: `pallet-${index + 1}`,
        lot: "",
        photos: [null, null, null, null],
      })),
    );
    setPalletEvidence(current => buildPalletEvidenceItems(currentQuantity, current));

    return true;
  }, [getValeusScreenPallet]);

  const hydrateOfflineOperation = useCallback((operation: OfflinePalletOperation) => {
    const roadmap = operation.formData?.roadmap ?? operation.roadmap ?? "";
    const quantity = operation.formData?.palletsQuantity ?? "";
    const parsedHydratedQuantity = Number(quantity);

    setOfflineOperationId(operation.id);
    setOperationPallet(operation.operationType);
    setRoute(roadmap);
    setPalletQuantity(quantity);
    setFormScreenPalletValue("roadmap", roadmap, { shouldValidate: true });
    setFormScreenPalletValue("palletsQuantity", quantity, { shouldValidate: true });
    setPalletEvidence(
      buildPalletEvidenceItems(
        Number.isInteger(parsedHydratedQuantity) && parsedHydratedQuantity > 0
          ? parsedHydratedQuantity
          : operation.palletEvidenceData?.pallets.length ?? 0,
        operation.palletEvidenceData?.pallets.map(pallet => ({
          batch: pallet.batch,
          photos: pallet.photos,
        })) ?? [],
      ),
    );
    setShipGoodsPhotos({
      truck: operation.shipGoodsData?.truck ?? null,
    });
    setExitExtraEvidencePhotos({
      licensePlate: operation.exitExtraEvidenceData?.licensePlate ?? null,
      seal: operation.exitExtraEvidenceData?.seal ?? null,
    });
  }, [setFormScreenPalletValue]);

  const resetEntry = useCallback(() => {
    setRoute("");
    setPalletQuantity("");
    setPallets([]);
    setPalletEvidence([]);
    setScanTarget(null);
    setOfflineOperationId(null);
    setShipGoodsPhotos(initialShipGoodsPhotos);
    setExitExtraEvidencePhotos(initialExitExtraEvidencePhotos);
    resetFormScreenPallet({ roadmap: "", palletsQuantity: "" });
  }, [resetFormScreenPallet]);

  const value = useMemo<PalletContextValue>(
    () => ({
      route,
      palletQuantity,
      pallets,
      scanTarget,
      canConfirmForm,
      canConfirmPallets,
      setPalletQuantity: updatePalletQuantity,
      setScanTarget,
      startPalletCapture,
      resetEntry,
      controlFormScreenPallet,
      setFormScreenPalletValue,
      isValidFormScreenPalletValue,
      getValeusScreenPallet,
      operationPallet,
      setOperationPallet,
      offlineOperationId,
      setOfflineOperationId,
      palletEvidence,
      setPalletEvidence,
      shipGoodsPhotos,
      setShipGoodsPhotos,
      exitExtraEvidencePhotos,
      setExitExtraEvidencePhotos,
      hydrateOfflineOperation,
    }),
    [
      route,
      palletQuantity,
      pallets,
      scanTarget,
      canConfirmForm,
      canConfirmPallets,
      updatePalletQuantity,
      startPalletCapture,
      resetEntry,
      controlFormScreenPallet,
      setFormScreenPalletValue,
      isValidFormScreenPalletValue,
      getValeusScreenPallet,
      operationPallet,
      offlineOperationId,
      palletEvidence,
      shipGoodsPhotos,
      exitExtraEvidencePhotos,
      hydrateOfflineOperation,
    ],
  );

  return (
    <PalletContext.Provider value={value}>{children}</PalletContext.Provider>
  );
}

function buildPalletEvidenceItems(quantity: number, current: PalletEvidenceItem[] = []) {
  return Array.from({ length: quantity }, (_, index) => ({
    batch: current[index]?.batch ?? "",
    photos: buildPhotoSlots(current[index]?.photos),
  }));
}

function buildPhotoSlots(photos: string[] = []) {
  return Array.from({ length: 4 }, (_, index) => photos[index] ?? "");
}

export function usePallet() {
  const context = useContext(PalletContext);

  if (!context) {
    throw new Error("usePallet must be used within a PalletProvider");
  }

  return context;
}
