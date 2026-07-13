import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthSession } from "@shared/services/authSession";
import {
  OfflinePalletOperation,
  OfflinePalletOperationType,
} from "../../protocol";
import {
  deleteOfflinePalletOperation,
  listOfflinePalletOperations,
} from "../../services/offlinePalletOperations";
import { deletePalletOperationImageDirectory } from "../../services/palletImageStorage";

type UseOfflinePalletDraftsParams = {
  operationType: OfflinePalletOperationType;
};

export function useOfflinePalletDrafts({ operationType }: UseOfflinePalletDraftsParams) {
  const { userId } = useAuthSession();
  const [drafts, setDrafts] = useState<OfflinePalletOperation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDrafts = useCallback(async () => {
    const nextDrafts = userId
      ? await listOfflinePalletOperations(operationType, userId)
      : [];
    setDrafts(nextDrafts);
  }, [operationType, userId]);

  const refreshDrafts = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadDrafts();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadDrafts]);

  const deleteDraft = useCallback(async (operation: OfflinePalletOperation) => {
    if (!userId) return;

    await deleteOfflinePalletOperation(operation.id, userId);
    await deletePalletOperationImageDirectory({
      operationId: operation.id,
      operationType: operation.operationType,
      roadmap: operation.roadmap,
    });
    await loadDrafts();
  }, [loadDrafts, userId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setIsLoading(true);
      const draftsPromise = userId
        ? listOfflinePalletOperations(operationType, userId)
        : Promise.resolve([]);

      draftsPromise
        .then(nextDrafts => {
          if (active) setDrafts(nextDrafts);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });

      return () => {
        active = false;
      };
    }, [operationType, userId]),
  );

  return {
    deleteDraft,
    drafts,
    isLoading,
    isRefreshing,
    refreshDrafts,
  };
}
