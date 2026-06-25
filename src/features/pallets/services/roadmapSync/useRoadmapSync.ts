import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { hasApiBaseUrl, isApiValidationError } from "@shared/services/apiClient";
import { useNetworkState } from "@shared/services/network";
import {
  getOfflinePalletOperation,
  listPendingSyncPalletOperations,
  updateOfflinePalletOperationStatus,
} from "../offlinePalletOperations";
import { useRoadmapApi } from "../roadmapApi";
import { OfflineOperationValidationError, syncOfflinePalletOperation } from "./roadmapSyncService";

export type RoadmapSyncState = "idle" | "syncing" | "synced" | "failed" | "skipped";

export function useRoadmapSync() {
  const roadmapApi = useRoadmapApi();
  const { hasCheckedNetwork, isOnline } = useNetworkState();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<RoadmapSyncState>("idle");
  const canUseNetwork = hasCheckedNetwork && isOnline;

  const syncOperation = useCallback(async (operationId: string) => {
    if (!hasApiBaseUrl() || !roadmapApi.hasAuthToken || !canUseNetwork) {
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
      await queryClient.invalidateQueries({ queryKey: ["roadmap"] });
      await queryClient.invalidateQueries({ queryKey: ["quality-report"] });
      setState("synced");
      return roadmap;
    } catch (syncError) {
      if (syncError instanceof OfflineOperationValidationError) {
        await updateOfflinePalletOperationStatus({
          id: operation.id,
          lastError: syncError.message,
          status: "validation_failed",
          validationIssues: syncError.issues,
        });
        setError(syncError.message);
        setState("failed");
        return null;
      }

      if (isApiValidationError(syncError)) {
        const message = syncError instanceof Error ? syncError.message : "Operação precisa ser revisada antes da sincronização.";
        await updateOfflinePalletOperationStatus({
          id: operation.id,
          lastError: message,
          status: "validation_failed",
          validationIssues: [{ message, stage: getValidationIssueStage(message, operation.operationType) }],
        });
        setError(message);
        setState("failed");
        return null;
      }

      const message = syncError instanceof Error ? syncError.message : "Falha ao sincronizar movimentacao.";
      await updateOfflinePalletOperationStatus({ id: operation.id, lastError: message, status: "failed" });
      setError(message);
      setState("failed");
      return null;
    }
  }, [canUseNetwork, queryClient, roadmapApi]);

  const syncPendingOperations = useCallback(async () => {
    if (!hasApiBaseUrl() || !roadmapApi.hasAuthToken || !canUseNetwork) return;

    const operations = await listPendingSyncPalletOperations();
    for (const operation of operations) {
      await syncOperation(operation.id);
    }
  }, [canUseNetwork, roadmapApi.hasAuthToken, syncOperation]);

  return {
    error,
    isSyncing: state === "syncing",
    state,
    syncOperation,
    syncPendingOperations,
  };
}

function getValidationIssueStage(message: string, operationType: "entry" | "exit") {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("roteiro")) return "form";
  if (operationType === "exit" && normalizedMessage.includes("foto")) return "exit_extra_evidence";

  return "pallets_evidence";
}
