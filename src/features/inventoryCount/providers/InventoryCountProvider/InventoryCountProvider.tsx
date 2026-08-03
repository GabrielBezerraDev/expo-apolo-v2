import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ActiveInventoryBin,
  InventoryCount,
  InventoryCountDraft,
  ParsedBinCode,
  ParsedMaterialCode,
  ScannedMaterial,
} from "../../protocol";

type StartBinResult =
  | { status: "duplicate" }
  | { status: "invalidState" }
  | { binId: string; status: "started" };
type AddMaterialResult = "added" | "duplicate" | "invalidState";

type InventoryCountContextValue = {
  addMaterial: (material: ParsedMaterialCode) => AddMaterialResult;
  cancelActiveBin: () => void;
  completeActiveBin: () => boolean;
  counts: InventoryCount[];
  discardDraft: () => void;
  draft: InventoryCountDraft | null;
  finishCount: () => boolean;
  startBin: (bin: ParsedBinCode) => StartBinResult;
  startCount: () => void;
};

const InventoryCountContext = createContext<
  InventoryCountContextValue | undefined
>(undefined);

let localIdSequence = 0;

export function InventoryCountProvider({ children }: PropsWithChildren) {
  const [counts, setCounts] = useState<InventoryCount[]>([]);
  const [draft, setDraftState] = useState<InventoryCountDraft | null>(null);
  const draftRef = useRef<InventoryCountDraft | null>(null);

  const setDraft = useCallback((nextDraft: InventoryCountDraft | null) => {
    draftRef.current = nextDraft;
    setDraftState(nextDraft);
  }, []);

  const startCount = useCallback(() => {
    setDraft({
      bins: [],
      id: createLocalId("count"),
      startedAt: new Date().toISOString(),
    });
  }, [setDraft]);

  const startBin = useCallback(
    (bin: ParsedBinCode): StartBinResult => {
      const currentDraft = draftRef.current;
      if (!currentDraft || currentDraft.activeBin) {
        return { status: "invalidState" };
      }

      const isDuplicate = currentDraft.bins.some(
        item => item.address === bin.address,
      );
      if (isDuplicate) return { status: "duplicate" };

      const activeBin: ActiveInventoryBin = {
        ...bin,
        id: createLocalId("bin"),
        materials: [],
        startedAt: new Date().toISOString(),
      };

      setDraft({ ...currentDraft, activeBin });
      return { binId: activeBin.id, status: "started" };
    },
    [setDraft],
  );

  const addMaterial = useCallback(
    (material: ParsedMaterialCode): AddMaterialResult => {
      const currentDraft = draftRef.current;
      const activeBin = currentDraft?.activeBin;
      if (!currentDraft || !activeBin) return "invalidState";

      const normalizedLabelId = material.labelId.toUpperCase();
      const scannedMaterials = [
        ...currentDraft.bins.flatMap(bin => bin.materials),
        ...activeBin.materials,
      ];
      const isDuplicate = scannedMaterials.some(
        item => item.labelId.toUpperCase() === normalizedLabelId,
      );
      if (isDuplicate) return "duplicate";

      const scannedMaterial: ScannedMaterial = {
        ...material,
        id: createLocalId("material"),
        scannedAt: new Date().toISOString(),
      };

      setDraft({
        ...currentDraft,
        activeBin: {
          ...activeBin,
          materials: [...activeBin.materials, scannedMaterial],
        },
      });
      return "added";
    },
    [setDraft],
  );

  const completeActiveBin = useCallback(() => {
    const currentDraft = draftRef.current;
    const activeBin = currentDraft?.activeBin;
    if (!currentDraft || !activeBin) return false;

    const { activeBin: _activeBin, ...draftWithoutActiveBin } = currentDraft;
    setDraft({
      ...draftWithoutActiveBin,
      bins: [
        ...currentDraft.bins,
        { ...activeBin, completedAt: new Date().toISOString() },
      ],
    });
    return true;
  }, [setDraft]);

  const cancelActiveBin = useCallback(() => {
    const currentDraft = draftRef.current;
    if (!currentDraft?.activeBin) return;

    const { activeBin: _activeBin, ...draftWithoutActiveBin } = currentDraft;
    setDraft(draftWithoutActiveBin);
  }, [setDraft]);

  const finishCount = useCallback(() => {
    const currentDraft = draftRef.current;
    if (!currentDraft || currentDraft.activeBin || currentDraft.bins.length === 0) {
      return false;
    }

    const completedCount: InventoryCount = {
      bins: currentDraft.bins,
      completedAt: new Date().toISOString(),
      id: currentDraft.id,
      startedAt: currentDraft.startedAt,
      status: "COMPLETED",
    };

    setCounts(current => [completedCount, ...current]);
    setDraft(null);
    return true;
  }, [setDraft]);

  const discardDraft = useCallback(() => {
    setDraft(null);
  }, [setDraft]);

  const value = useMemo<InventoryCountContextValue>(
    () => ({
      addMaterial,
      cancelActiveBin,
      completeActiveBin,
      counts,
      discardDraft,
      draft,
      finishCount,
      startBin,
      startCount,
    }),
    [
      addMaterial,
      cancelActiveBin,
      completeActiveBin,
      counts,
      discardDraft,
      draft,
      finishCount,
      startBin,
      startCount,
    ],
  );

  return (
    <InventoryCountContext.Provider value={value}>
      {children}
    </InventoryCountContext.Provider>
  );
}

export function useInventoryCount() {
  const context = useContext(InventoryCountContext);
  if (!context) {
    throw new Error(
      "useInventoryCount must be used within an InventoryCountProvider",
    );
  }

  return context;
}

function createLocalId(prefix: string) {
  localIdSequence += 1;
  return `${prefix}-${Date.now()}-${localIdSequence}`;
}
