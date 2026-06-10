import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  OfflinePalletOperation,
  OfflinePalletOperationType,
} from "../../types/offlinePalletOperation";
import {
  deleteOfflinePalletOperation,
  listOfflinePalletOperations,
} from "../../services/offlinePalletOperations";
import { deletePalletOperationImageDirectory } from "../../services/palletImageStorage";

type UseOfflinePalletDraftsParams = {
  operationType: OfflinePalletOperationType;
};

export function useOfflinePalletDrafts({ operationType }: UseOfflinePalletDraftsParams) {
  const [drafts, setDrafts] = useState<OfflinePalletOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDrafts = useCallback(async () => {
    const nextDrafts = await listOfflinePalletOperations(operationType);
    setDrafts(nextDrafts);
  }, [operationType]);

  const refreshDrafts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadDrafts();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadDrafts]);

  const deleteDraft = useCallback(async (operation: OfflinePalletOperation) => {
    await deleteOfflinePalletOperation(operation.id);
    await deletePalletOperationImageDirectory({
      operationId: operation.id,
      operationType: operation.operationType,
      roadmap: operation.roadmap,
    });
    await loadDrafts();
  }, [loadDrafts]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setIsLoading(true);
      listOfflinePalletOperations(operationType)
        .then(nextDrafts => {
          if (active) setDrafts(nextDrafts);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });

      return () => {
        active = false;
      };
    }, [operationType]),
  );

  return {
    deleteDraft,
    drafts,
    isLoading,
    isRefreshing,
    refreshDrafts,
  };
}
