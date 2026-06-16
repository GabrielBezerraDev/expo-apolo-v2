import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClipboardPlus, Filter } from "lucide-react-native";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import {
  PaginationComponent,
  usePagination,
  WrapperPagination,
} from "@shared/components/Navigation/Pagination";
import { FilterChips } from "@shared/components/Filters";
import { RefreshableList } from "@shared/components/Display";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import { usePallet } from "../../providers/PalletProvider";
import { OfflinePalletDraftList } from "../../components/OfflinePalletDraftList";
import { OperationCard, type OperationItem } from "../../components/OperationCard";
import { OperationListTabs, OperationListTabValue } from "../../components/OperationListTabs";
import { ListScreenShell } from "../../components/ListScreenShell";
import { useOperationListFilters } from "../../hooks/useOperationListFilters";
import { useRoadmapList } from "../../hooks/useRoadmapList";
import { useRoadmapSync } from "../../hooks/useRoadmapSync";
import type { Roadmap } from "../../types/roadmap";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function EntryListScreen() {
  const navigation = useNavigation<Navigation>();
  const [activeTab, setActiveTab] = useState<OperationListTabValue>("operations");
  const { resetEntry, setOperationPallet } = usePallet();
  const { currentPage, itemsPerPage, sendToFirstPage, setPaginationMeta } = usePagination();
  const { syncPendingOperations } = useRoadmapSync();
  const {
    appliedFilters,
    chips,
    openFilterModal,
  } = useOperationListFilters({ modalTitle: "Filtrar entradas" });
  const roadmapQuery = useRoadmapList({
    appliedFilters,
    page: currentPage,
    pageSize: itemsPerPage,
    typeRoadmap: "ENTRY",
  });
  const operations = (roadmapQuery.data?.data ?? []).map(mapRoadmapToEntryOperation);
  const canLoadRoadmaps = hasApiBaseUrl();
  const errorMessage = canLoadRoadmaps
    ? roadmapQuery.error?.message
    : "Configure EXPO_PUBLIC_API_URL para carregar as entradas.";
  const refresh = roadmapQuery.isRefetching && !roadmapQuery.isLoading;
  const refreshOperations = canLoadRoadmaps ? () => { void roadmapQuery.refetch(); } : undefined;

  useFocusEffect(
    useCallback(() => {
      void syncPendingOperations();
    }, [syncPendingOperations]),
  );

  useEffect(() => {
    sendToFirstPage();
  }, [appliedFilters, sendToFirstPage]);

  useEffect(() => {
    const meta = roadmapQuery.data?.meta;
    if (!meta) return;

    setPaginationMeta({
      currentPage: meta.page,
      lastPage: meta.totalPages,
      totalItems: meta.total,
    });
  }, [roadmapQuery.data?.meta, setPaginationMeta]);

  const startEntry = () => {
    resetEntry();
    setOperationPallet("entry");
    navigation.navigate("FormScreenPallet");
  };

  return (
    <ListScreenShell
      title="Entradas"
      floatActions={[
        { Icon: ClipboardPlus, label: "Nova entrada", onPress: startEntry },
        {
          Icon: Filter,
          label: "Filtro",
          onPress: openFilterModal,
        },
      ]}
    >
      <OperationListTabs value={activeTab} operationsLabel="Entradas" onChange={setActiveTab} />
      {activeTab === "drafts" ? (
        <OfflinePalletDraftList operationType="entry" />
      ) : (
        <>
          <FilterChips chips={chips} />
          <RefreshableList
            data={operations}
            emptyMessage="Não há entradas para listar."
            errorMessage={errorMessage}
            isError={!canLoadRoadmaps || roadmapQuery.isError}
            isLoading={roadmapQuery.isLoading}
            isRefreshing={refresh}
            keyExtractor={(item) => item.id}
            loadingLabel="Carregando entradas"
            onRefresh={refreshOperations}
            renderItem={({ item }) => <OperationCard item={item} />}
          />
          <WrapperPagination>
            <PaginationComponent />
          </WrapperPagination>
        </>
      )}
    </ListScreenShell>
  );
}

function mapRoadmapToEntryOperation(roadmap: Roadmap): OperationItem {
  return {
    completedSteps: `${roadmap.pallets?.length ?? 0}/${roadmap.palletsQuantity} paletes vinculados`,
    doneAt: formatDate(roadmap.updatedAt),
    id: String(roadmap.id),
    roadmap: roadmap.roadmap,
    status: roadmap.statusRoadmap === "FINISHED" ? "Finalizado" : "Em progresso",
    totalPallets: roadmap.palletsQuantity,
    type: "entry",
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
