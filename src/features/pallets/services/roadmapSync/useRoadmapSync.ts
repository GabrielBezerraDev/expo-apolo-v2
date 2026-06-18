import { useCallback, useState } from "react";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import {
  getOfflinePalletOperation,
  listPendingSyncPalletOperations,
  updateOfflinePalletOperationStatus,
} from "../offlinePalletOperations";
import { useRoadmapApi } from "../roadmapApi";
import { syncOfflinePalletOperation } from "./roadmapSyncService";

export type RoadmapSyncState = "idle" | "syncing" | "synced" | "failed" | "skipped";

export function useRoadmapSync() {
  const roadmapApi = useRoadmapApi();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<RoadmapSyncState>("idle");

  const syncOperation = useCallback(async (operationId: string) => {
    if (!hasApiBaseUrl() || !roadmapApi.hasAuthToken) {
      setState("skipped");
      return null;
    }

    const operation = await getOfflinePalletOperation(operationId);
    if (!operation || operation.status === "synced") {
      setState("skipped");
      return null;
    }

    setError(null);
    setState("syncing");
    await updateOfflinePalletOperationStatus({ id: operation.id, status: "syncing" });

    try {
      const roadmap = await syncOfflinePalletOperation(roadmapApi, operation);
      await updateOfflinePalletOperationStatus({ id: operation.id, status: "synced" });
      setState("synced");
      return roadmap;
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : "Falha ao sincronizar movimentacao.";
      await updateOfflinePalletOperationStatus({ id: operation.id, lastError: message, status: "failed" });
      setError(message);
      setState("failed");
      return null;
    }
  }, [roadmapApi]);

  const syncPendingOperations = useCallback(async () => {
    if (!hasApiBaseUrl() || !roadmapApi.hasAuthToken) return;

    const operations = await listPendingSyncPalletOperations();
    for (const operation of operations) {
      await syncOperation(operation.id);
    }
  }, [roadmapApi.hasAuthToken, syncOperation]);

  return {
    error,
    isSyncing: state === "syncing",
    state,
    syncOperation,
    syncPendingOperations,
  };
}
