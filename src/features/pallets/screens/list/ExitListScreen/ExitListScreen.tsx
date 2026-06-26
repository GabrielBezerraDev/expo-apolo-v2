import React, { useDeferredValue, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button } from "tamagui";
import { Filter, PackageMinus, Search, X } from "lucide-react-native";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import {
  PaginationComponent,
  PaginationProvider,
  usePagination,
  WrapperPagination,
} from "@shared/components/Navigation/Pagination";
import { FilterChips } from "@shared/components/Filters";
import { RefreshableList } from "@shared/components/Display";
import { AppInput } from "@shared/components/Forms/AppInput";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { hasApiBaseUrl, isApiTimeoutError } from "@shared/services/apiClient";
import { useNetworkState } from "@shared/services/network";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { OfflinePalletDraftList } from "../../../components/OfflinePalletDraftList";
import { OperationCard, type OperationItem } from "../../../components/OperationCard";
import { OperationListTabs, OperationListTabValue } from "../../../components/OperationListTabs";
import { ListScreenShell } from "../../../components/ListScreenShell";
import { usePallet } from "../../../providers/PalletProvider";
import type { Roadmap } from "../../../protocol";
import { useOperationListFilters, useRoadmapList } from "../hooks";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function ExitListScreen() {
  return (
    <PaginationProvider>
      <ExitListScreenContent />
    </PaginationProvider>
  );
}

function ExitListScreenContent() {
  const navigation = useNavigation<Navigation>();
  const { theme } = useThemeMode();
  const { hasCheckedNetwork, isOnline } = useNetworkState();
  const [activeTab, setActiveTab] = useState<OperationListTabValue>("operations");
  const [operationSearch, setOperationSearch] = useState("");
  const deferredOperationSearch = useDeferredValue(operationSearch.trim());
  const { resetEntry, setOperationPallet } = usePallet();
  const { currentPage, itemsPerPage, sendToFirstPage, setPaginationMeta } = usePagination();
  const {
    appliedFilters,
    chips,
    openFilterModal,
  } = useOperationListFilters({ modalTitle: "Filtrar saídas" });
  const roadmapQuery = useRoadmapList({
    appliedFilters,
    filterSearch: deferredOperationSearch,
    page: currentPage,
    pageSize: itemsPerPage,
    typeRoadmap: "EXIT",
  });
  const operations = (roadmapQuery.data?.data ?? []).map(mapRoadmapToExitOperation);
  const canLoadRoadmaps = hasApiBaseUrl();
  const isOfflineState = canLoadRoadmaps && hasCheckedNetwork && !isOnline;
  const errorMessage = canLoadRoadmaps
    ? roadmapQuery.error?.message
    : "Configure EXPO_PUBLIC_API_URL para carregar as saídas.";
  const refresh = roadmapQuery.isRefetching && !roadmapQuery.isLoading;
  const refreshOperations = canLoadRoadmaps ? () => { void roadmapQuery.refetch(); } : undefined;

  useEffect(() => {
    sendToFirstPage();
  }, [appliedFilters, deferredOperationSearch, sendToFirstPage]);

  useEffect(() => {
    const meta = roadmapQuery.data?.meta;
    if (!meta) return;

    setPaginationMeta({
      currentPage: meta.page,
      lastPage: meta.totalPages,
      totalItems: meta.total,
    });
  }, [roadmapQuery.data?.meta, setPaginationMeta]);

  const startExit = () => {
    resetEntry();
    setOperationPallet("exit");
    navigation.navigate("FormScreenRoadmap");
  };

  return (
    <ListScreenShell
      title="Saídas"
      floatActions={[
        { Icon: PackageMinus, label: "Nova Saída", onPress: startExit },
        { Icon: Filter, label: "Filtro", onPress: openFilterModal },
      ]}
    >
      <AppInput
        value={operationSearch}
        onChangeText={setOperationSearch}
        placeholder="Filtrar por roteiro..."
        autoCapitalize="characters"
        leftIcon={<Search size={22} color={theme.primary} />}
        rightIcon={
          operationSearch ? (
            <Button unstyled pressStyle={buttonPressStyle} onPress={() => setOperationSearch("")} hitSlop={10}>
              <X size={22} color={theme.primary} />
            </Button>
          ) : null
        }
      />
      <OperationListTabs value={activeTab} operationsLabel="Saídas" onChange={setActiveTab} />
      {activeTab === "drafts" ? (
        <OfflinePalletDraftList operationType="exit" search={deferredOperationSearch} />
      ) : (
        <>
          <FilterChips chips={chips} />
          <RefreshableList
            data={operations}
            emptyMessage="Não há registros de saídas"
            errorMessage={errorMessage}
            isError={!canLoadRoadmaps || roadmapQuery.isError}
            isLoading={roadmapQuery.isLoading}
            isOfflineState={isOfflineState}
            isRefreshing={refresh}
            isTimeoutError={isApiTimeoutError(roadmapQuery.error)}
            keyExtractor={(item) => item.id}
            loadingLabel="Carregando saídas"
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

function mapRoadmapToExitOperation(roadmap: Roadmap): OperationItem {
  return {
    completedSteps: `${roadmap.pallets?.length ?? 0}/${roadmap.palletsQuantity} paletes vinculados`,
    doneAt: formatDate(roadmap.updatedAt),
    id: String(roadmap.id),
    roadmap: roadmap.roadmap,
    roadmapDetails: roadmap,
    status: roadmap.statusRoadmap === "FINISHED" ? "Finalizado" : "Em progresso",
    totalPallets: roadmap.palletsQuantity,
    type: "exit",
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
