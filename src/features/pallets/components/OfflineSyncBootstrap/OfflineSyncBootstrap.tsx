import React, { useCallback, useEffect, useRef } from "react";
import { useNetworkState } from "@shared/services/network";
import { useRoadmapSync } from "../../services/roadmapSync";

export function OfflineSyncBootstrap() {
  const { hasCheckedNetwork, isOnline } = useNetworkState();
  const { syncPendingOperations } = useRoadmapSync();
  const hasStartedRef = useRef(false);
  const previousIsOnlineRef = useRef<boolean | null>(null);
  const syncInFlightRef = useRef(false);

  const syncPendingOperationsSafely = useCallback(async () => {
    if (!hasCheckedNetwork || !isOnline || syncInFlightRef.current) return;

    syncInFlightRef.current = true;
    try {
      await syncPendingOperations();
    } finally {
      syncInFlightRef.current = false;
    }
  }, [hasCheckedNetwork, isOnline, syncPendingOperations]);

  useEffect(() => {
    if (!hasCheckedNetwork) return;

    const previousIsOnline = previousIsOnlineRef.current;
    previousIsOnlineRef.current = isOnline;

    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      void syncPendingOperationsSafely();
      return;
    }

    if (previousIsOnline === false && isOnline) {
      void syncPendingOperationsSafely();
    }
  }, [hasCheckedNetwork, isOnline, syncPendingOperationsSafely]);

  return null;
}
