import React, { useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { RefreshableList } from "@shared/components/Display";
import { useFeedbackModal } from "@shared/components/Display/Modal";
import { OfflinePalletOperation, OfflinePalletOperationStep, OfflinePalletOperationType } from "../../protocol";
import { useOfflinePalletOperation } from "../../services/offlinePalletOperations";
import { useRoadmapSync } from "../../services/roadmapSync";
import { OfflinePalletDraftCard } from "../OfflinePalletDraftCard";
import { useOfflinePalletDrafts } from "./useOfflinePalletDrafts";

type Props = {
  operationType: OfflinePalletOperationType;
  search?: string;
};

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function OfflinePalletDraftList({ operationType, search = "" }: Props) {
  const navigation = useNavigation<Navigation>();
  const { showConfirm } = useFeedbackModal();
  const { hydrateOperationById } = useOfflinePalletOperation();
  const { deleteDraft, drafts, isLoading, isRefreshing, refreshDrafts } = useOfflinePalletDrafts({ operationType });
  const { syncOperation } = useRoadmapSync();
  const normalizedSearch = search.trim().toLowerCase();
  const filteredDrafts = useMemo(
    () => normalizedSearch ? drafts.filter(item => draftMatchesSearch(item, normalizedSearch)) : drafts,
    [drafts, normalizedSearch],
  );
  
  const reviewStage = useCallback(async (item: OfflinePalletOperation, stage: OfflinePalletOperationStep) => {
    await hydrateOperationById(item.id, { clearInvalidFields: true, reviewStage: stage });
    navigateToReviewStage(navigation, stage, item.id);
  }, [hydrateOperationById, navigation]);

  return (
    <RefreshableList
      data={filteredDrafts}
      emptyMessage={normalizedSearch ? "Nenhum rascunho encontrado para o lote informado." : "Nenhum rascunho encontrado."}
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
            showConfirm({
              title: "Excluir rascunho",
              message: `Deseja excluir o rascunho ${item.roadmap ?? "sem roteiro"}?`,
              confirmLabel: "Excluir",
              onConfirm: () => { void deleteDraft(item); },
            });
          }}
        />
      )}
    />
  );
}

function draftMatchesSearch(item: OfflinePalletOperation, search: string) {
  const values = [
    item.roadmap,
    item.formData?.roadmap,
    ...(item.palletEvidenceData?.pallets.map(pallet => pallet.batch) ?? []),
    ...(item.validationIssues?.map(issue => issue.batch) ?? []),
  ];

  return values.some(value => value?.toLowerCase().includes(search));
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
