import React, { useDeferredValue, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button } from "tamagui";
import { ClipboardPlus, Filter, PackageMinus, Search, X } from "lucide-react-native";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { RefreshableList } from "@shared/components/Display";
import { FilterChips } from "@shared/components/Filters";
import { AppInput } from "@shared/components/Forms/AppInput";
import {
  PaginationComponent,
  PaginationProvider,
  usePagination,
  WrapperPagination,
} from "@shared/components/Navigation/Pagination";
import { hasApiBaseUrl, isApiTimeoutError } from "@shared/services/apiClient";
import { useNetworkState } from "@shared/services/network";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { ListScreenShell } from "../../../components/ListScreenShell";
import { OfflinePalletDraftList } from "../../../components/OfflinePalletDraftList";
import { OperationCard, type OperationItem } from "../../../components/OperationCard";
import { OperationListTabs, OperationListTabValue } from "../../../components/OperationListTabs";
import { usePallet } from "../../../providers/PalletProvider";
import type { OfflinePalletOperationType, Roadmap, RoadmapType } from "../../../protocol";
import { useOperationListFilters, useRoadmapList } from "../hooks";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type OperationListScreenProps = {
  operationType: OfflinePalletOperationType;
};

type OperationListConfig = {
  emptyMessage: string;
  filterTitle: string;
  loadingLabel: string;
  newOperationLabel: string;
  NewOperationIcon: React.ComponentType<any>;
  operationLabel: string;
  roadmapType: RoadmapType;
  title: string;
  unavailableMessage: string;
};

const OPERATION_CONFIG: Record<OfflinePalletOperationType, OperationListConfig> = {
  entry: {
    emptyMessage: "Não há registros de entradas",
    filterTitle: "Filtrar entradas",
    loadingLabel: "Carregando entradas",
    newOperationLabel: "Nova entrada",
    NewOperationIcon: ClipboardPlus,
    operationLabel: "Entradas",
    roadmapType: "ENTRY",
    title: "Entradas",
    unavailableMessage: "Configure EXPO_PUBLIC_API_URL para carregar as entradas.",
  },
  exit: {
    emptyMessage: "Não há registros de saídas",
    filterTitle: "Filtrar saídas",
    loadingLabel: "Carregando saídas",
    newOperationLabel: "Nova saída",
    NewOperationIcon: PackageMinus,
    operationLabel: "Saídas",
    roadmapType: "EXIT",
    title: "Saídas",
    unavailableMessage: "Configure EXPO_PUBLIC_API_URL para carregar as saídas.",
  },
};

export function OperationListScreen(props: OperationListScreenProps) {
  return (
    <PaginationProvider>
      <OperationListScreenContent {...props} />
    </PaginationProvider>
  );
}

function OperationListScreenContent({ operationType }: OperationListScreenProps) {
  const config = OPERATION_CONFIG[operationType];
  const navigation = useNavigation<Navigation>();
  const { theme } = useThemeMode();
  const { hasCheckedNetwork, isOnline } = useNetworkState();
  const [activeTab, setActiveTab] = useState<OperationListTabValue>("operations");
  const [operationSearch, setOperationSearch] = useState("");
  const deferredOperationSearch = useDeferredValue(operationSearch.trim());
  const { resetEntry, setOperationPallet } = usePallet();
  const { currentPage, itemsPerPage, sendToFirstPage, setPaginationMeta } = usePagination();
  const { appliedFilters, chips, openFilterModal } = useOperationListFilters({
    modalTitle: config.filterTitle,
  });
  const roadmapQuery = useRoadmapList({
    appliedFilters,
    filterSearch: deferredOperationSearch,
    page: currentPage,
    pageSize: itemsPerPage,
    typeRoadmap: config.roadmapType,
  });
  const operations = (roadmapQuery.data?.data ?? []).map(roadmap =>
    mapRoadmapToOperation(roadmap, operationType),
  );
  const canLoadRoadmaps = hasApiBaseUrl();
  const isOfflineState = canLoadRoadmaps && hasCheckedNetwork && !isOnline;
  const errorMessage = canLoadRoadmaps
    ? roadmapQuery.error?.message
    : config.unavailableMessage;
  const isRefreshing = roadmapQuery.isRefetching && !roadmapQuery.isLoading;
  const refreshOperations = canLoadRoadmaps
    ? () => { void roadmapQuery.refetch(); }
    : undefined;

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

  const startOperation = () => {
    resetEntry();
    setOperationPallet(operationType);
    navigation.navigate("FormScreenRoadmap");
  };

  return (
    <ListScreenShell
      title={config.title}
      floatActions={[
        {
          Icon: config.NewOperationIcon,
          label: config.newOperationLabel,
          onPress: startOperation,
        },
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
            <Button
              unstyled
              pressStyle={buttonPressStyle}
              onPress={() => setOperationSearch("")}
              hitSlop={10}
            >
              <X size={22} color={theme.primary} />
            </Button>
          ) : null
        }
      />
      <OperationListTabs
        value={activeTab}
        operationsLabel={config.operationLabel}
        onChange={setActiveTab}
      />
      {activeTab === "drafts" ? (
        <OfflinePalletDraftList operationType={operationType} search={deferredOperationSearch} />
      ) : (
        <>
          <FilterChips chips={chips} />
          <RefreshableList
            data={operations}
            emptyMessage={config.emptyMessage}
            errorMessage={errorMessage}
            isError={!canLoadRoadmaps || roadmapQuery.isError}
            isLoading={roadmapQuery.isLoading}
            isOfflineState={isOfflineState}
            isRefreshing={isRefreshing}
            isTimeoutError={isApiTimeoutError(roadmapQuery.error)}
            keyExtractor={item => item.id}
            loadingLabel={config.loadingLabel}
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

function mapRoadmapToOperation(
  roadmap: Roadmap,
  operationType: OfflinePalletOperationType,
): OperationItem {
  return {
    completedSteps: `${roadmap.pallets?.length ?? 0}/${roadmap.palletsQuantity} paletes vinculados`,
    doneAt: formatDate(roadmap.updatedAt),
    id: String(roadmap.id),
    roadmap: roadmap.roadmap,
    roadmapDetails: roadmap,
    status: roadmap.statusRoadmap === "FINISHED" ? "Finalizado" : "Em progresso",
    totalPallets: roadmap.palletsQuantity,
    type: operationType,
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
