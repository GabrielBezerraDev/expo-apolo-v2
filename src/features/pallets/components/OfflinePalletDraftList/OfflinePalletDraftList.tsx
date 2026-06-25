import React, { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { RefreshableList } from "@shared/components/Display";
import { OfflinePalletOperation, OfflinePalletOperationStep, OfflinePalletOperationType } from "../../protocol";
import { useOfflinePalletOperation } from "../../services/offlinePalletOperations";
import { useRoadmapSync } from "../../services/roadmapSync";
import { OfflinePalletDraftCard } from "../OfflinePalletDraftCard";
import { useOfflinePalletDrafts } from "./useOfflinePalletDrafts";

type Props = {
  operationType: OfflinePalletOperationType;
};

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function OfflinePalletDraftList({ operationType }: Props) {
  const navigation = useNavigation<Navigation>();
  const { hydrateOperationById } = useOfflinePalletOperation();
  const { deleteDraft, drafts, isLoading, isRefreshing, refreshDrafts } = useOfflinePalletDrafts({ operationType });
  const { syncOperation } = useRoadmapSync();
  const reviewStage = useCallback(async (item: OfflinePalletOperation, stage: OfflinePalletOperationStep) => {
    await hydrateOperationById(item.id);
    navigateToReviewStage(navigation, stage, item.id);
  }, [hydrateOperationById, navigation]);

  return (
    <RefreshableList
      data={drafts}
      emptyMessage="Nenhum rascunho encontrado."
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      keyExtractor={(item) => item.id}
      loadingLabel="Carregando rascunhos"
      onRefresh={refreshDrafts}
      renderItem={({ item }) => (
        <OfflinePalletDraftCard
          item={item}
          onOpen={() => navigation.navigate("PalletOperationSummary", { operationId: item.id })}
          onReviewStage={reviewStage}
          onRetry={async () => {
            await syncOperation(item.id);
            await refreshDrafts();
          }}
          onDelete={() => {
            Alert.alert(
              "Excluir rascunho",
              `Deseja excluir o rascunho ${item.roadmap ?? "sem roteiro"}?`,
              [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Excluir",
                  style: "destructive",
                  onPress: () => { void deleteDraft(item); },
                },
              ],
            );
          }}
        />
      )}
    />
  );
}

function navigateToReviewStage(
  navigation: Navigation,
  stage: OfflinePalletOperationStep,
  operationId: string,
) {
  if (stage === "form") {
    navigation.navigate("FormScreenPallet");
    return;
  }

  if (stage === "pallets_evidence") {
    navigation.navigate("PalletsEvidence");
    return;
  }

  if (stage === "ship_goods" || stage === "exit_extra_evidence") {
    navigation.navigate("ExitExtraEvidence");
    return;
  }

  navigation.navigate("PalletOperationSummary", { operationId });
}
