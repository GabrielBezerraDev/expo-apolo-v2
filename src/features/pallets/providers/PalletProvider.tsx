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
  licensePlate: string | null;
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
  shipGoodsPhotos: ShipGoodsPhotos;
  setShipGoodsPhotos: Dispatch<SetStateAction<ShipGoodsPhotos>>;
};

export type OperationPallet = 'entry' | 'exit';

const PalletContext = createContext<PalletContextValue | undefined>(undefined);

const initialShipGoodsPhotos: ShipGoodsPhotos = {
  truck: null,
  licensePlate: null,
};

export function PalletProvider({ children }: PropsWithChildren) {
  const [route, setRoute] = useState("");
  const [palletQuantity, setPalletQuantity] = useState("");
  const [pallets, setPallets] = useState<EntryPallet[]>([]);
  const [scanTarget, setScanTarget] = useState<EntryScanTarget | null>(null);
  const [operationPallet, setOperationPallet] =  useState<OperationPallet>('entry');
  const [shipGoodsPhotos, setShipGoodsPhotos] = useState<ShipGoodsPhotos>(initialShipGoodsPhotos);
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

    return true;
  }, [getValeusScreenPallet]);

  const resetEntry = useCallback(() => {
    setRoute("");
    setPalletQuantity("");
    setPallets([]);
    setScanTarget(null);
    setShipGoodsPhotos(initialShipGoodsPhotos);
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
      shipGoodsPhotos,
      setShipGoodsPhotos,
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
      shipGoodsPhotos,
    ],
  );

  return (
    <PalletContext.Provider value={value}>{children}</PalletContext.Provider>
  );
}

export function usePallet() {
  const context = useContext(PalletContext);

  if (!context) {
    throw new Error("usePallet must be used within a PalletProvider");
  }

  return context;
}
