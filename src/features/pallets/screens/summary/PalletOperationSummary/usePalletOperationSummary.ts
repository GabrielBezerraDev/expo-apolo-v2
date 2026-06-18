import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import {
  OfflinePalletOperation,
  OfflinePalletOperationSummary,
} from "../../../protocol";
import {
  buildOfflinePalletOperationSummary,
  deleteOfflinePalletOperation,
  getOfflinePalletOperation,
  useOfflinePalletOperation,
} from "../../../services/offlinePalletOperations";
import { deletePalletOperationImageDirectory } from "../../../services/palletImageStorage";

type UsePalletOperationSummaryParams = {
  navigation: NativeStackNavigationProp<RootStackParamList, "PalletOperationSummary">;
  operationId: string;
};

export function usePalletOperationSummary({ navigation, operationId }: UsePalletOperationSummaryParams) {
  const [operation, setOperation] = useState<OfflinePalletOperation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hydrateOperationById } = useOfflinePalletOperation();

  const loadOperation = useCallback(() => getOfflinePalletOperation(operationId), [operationId]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setIsLoading(true);
      loadOperation()
        .then(nextOperation => {
          if (active) setOperation(nextOperation);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });

      return () => {
        active = false;
      };
    }, [loadOperation]),
  );

  const summary = useMemo<OfflinePalletOperationSummary | null>(
    () => operation ? buildOfflinePalletOperationSummary(operation) : null,
    [operation],
  );

  const continueDraft = useCallback(async () => {
    if (!summary?.nextStep) return;

    await hydrateOperationById(operationId);

    const routeByStep = {
      completed: undefined,
      exit_extra_evidence: "ExitExtraEvidence",
      form: "FormScreenPallet",
      pallets_evidence: "PalletsEvidence",
      ship_goods: "ExitExtraEvidence",
    } as const;
    const route = routeByStep[summary.nextStep];

    if (!route) return;

    navigation.navigate(route);
  }, [hydrateOperationById, navigation, operationId, summary?.nextStep]);

  const deleteDraft = useCallback(() => {
    if (!operation) return;

    Alert.alert(
      "Excluir rascunho",
      `Deseja excluir o rascunho ${operation.roadmap ?? "sem roteiro"}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deleteOfflinePalletOperation(operation.id);
            await deletePalletOperationImageDirectory({
              operationId: operation.id,
              operationType: operation.operationType,
              roadmap: operation.roadmap,
            });
            navigation.goBack();
          },
        },
      ],
    );
  }, [navigation, operation]);

  return {
    continueDraft,
    deleteDraft,
    isLoading,
    operation,
    summary,
  };
}
