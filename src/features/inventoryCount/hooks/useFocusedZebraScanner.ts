import { useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  addZebraScanListener,
  type ZebraScanResult,
} from "@shared/services/nativeScanner";

type UseFocusedZebraScannerParams = {
  enabled?: boolean;
  onScan: (result: ZebraScanResult) => void;
  onUnavailable?: (message: string) => void;
};

export function useFocusedZebraScanner({
  enabled = true,
  onScan,
  onUnavailable,
}: UseFocusedZebraScannerParams) {
  const onScanRef = useRef(onScan);
  const onUnavailableRef = useRef(onUnavailable);
  onScanRef.current = onScan;
  onUnavailableRef.current = onUnavailable;

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;

      try {
        const subscription = addZebraScanListener(result => {
          onScanRef.current(result);
        });

        return () => subscription.remove();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível iniciar o leitor Zebra.";
        onUnavailableRef.current?.(message);
        return undefined;
      }
    }, [enabled]),
  );
}
