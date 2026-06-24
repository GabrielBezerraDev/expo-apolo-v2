import React, { useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { listValidationFailedPalletOperations } from "../../services/offlinePalletOperations";
import { useRoadmapSync } from "../../services/roadmapSync";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function OfflineSyncBootstrap() {
  const navigation = useNavigation<Navigation>();
  const { syncPendingOperations } = useRoadmapSync();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;

    async function runInitialSync() {
      await syncPendingOperations();
      const operationsToReview = await listValidationFailedPalletOperations();

      if (operationsToReview.length > 0) {
        navigation.navigate("OfflineSyncReview");
      }
    }

    void runInitialSync();
  }, [navigation, syncPendingOperations]);

  return null;
}
