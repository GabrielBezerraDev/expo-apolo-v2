import React, { useDeferredValue, useEffect, useState } from "react";
import { Button } from "tamagui";
import { Search, SlidersHorizontal, X } from "lucide-react-native";
import {
  PaginationComponent,
  usePagination,
  WrapperPagination,
} from "@shared/components/Navigation/Pagination";
import { FilterChips } from "@shared/components/Filters";
import { RefreshableList } from "@shared/components/Display";
import { AppInput } from "@shared/components/Forms/AppInput";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import { ListScreenShell } from "../../components/ListScreenShell";
import { PalletReportStatusTabs } from "../../components/PalletReportStatusTabs";
import { QualityReportCard } from "../../components/QualityReportCard";
import { usePalletListFilters } from "../../hooks/usePalletListFilters";
import { useQualityReportList } from "../../hooks/useQualityReportList";
import { PalletReportType, QualityReport } from "../../types/qualityReport";

export function PalletListScreen() {
  const { theme } = useThemeMode();
  const [batchSearch, setBatchSearch] = useState("");
  const deferredBatchSearch = useDeferredValue(batchSearch.trim());
  const [reportType, setReportType] = useState<PalletReportType>("releasedPallet");
  const [reportsForFilterOptions, setReportsForFilterOptions] = useState<QualityReport[]>([]);
  const { currentPage, itemsPerPage, sendToFirstPage, setPaginationMeta } = usePagination();
  const {
    appliedFilters,
    chips,
    openFilterModal,
  } = usePalletListFilters({ reports: reportsForFilterOptions, modalTitle: "Filtrar paletes" });
  const qualityReportQuery = useQualityReportList({
    appliedFilters,
    batchSearch: deferredBatchSearch,
    page: currentPage,
    pageSize: itemsPerPage,
    reportType,
  });


  const reports = qualityReportQuery.data?.data ?? [];
  const canLoadReports = hasApiBaseUrl();
  const errorMessage = canLoadReports
    ? qualityReportQuery.error?.message
    : "Configure EXPO_PUBLIC_API_URL para carregar os reports.";
  const refresh = qualityReportQuery.isRefetching && !qualityReportQuery.isLoading;
  const refreshReports = canLoadReports ? () => { void qualityReportQuery.refetch(); } : undefined;

  useEffect(() => {
    sendToFirstPage();
  }, [appliedFilters, deferredBatchSearch, reportType, sendToFirstPage]);

  useEffect(() => {
    if (reports.length === 0) return;

    setReportsForFilterOptions(reports);
  }, [reports]);

  useEffect(() => {
    const meta = qualityReportQuery.data?.meta;
    if (!meta) return;

    setPaginationMeta({
      currentPage: meta.page,
      lastPage: meta.totalPages,
      totalItems: meta.total,
    });
  }, [qualityReportQuery.data?.meta, setPaginationMeta]);

  return (
    <ListScreenShell
      title="Paletes"
      floatActions={[
        {
          Icon: SlidersHorizontal,
          label: "Filtros",
          onPress: openFilterModal,
        },
      ]}
    >
      <AppInput
        value={batchSearch}
        onChangeText={setBatchSearch}
        placeholder="Filtrar por lote..."
        autoCapitalize="characters"
        leftIcon={<Search size={22} color={theme.primary} />}
        rightIcon={
          batchSearch ? (
            <Button unstyled onPress={() => setBatchSearch("")} hitSlop={10}>
              <X size={22} color={theme.primary} />
            </Button>
          ) : null
        }
      />
      <PalletReportStatusTabs value={reportType} onChange={setReportType} />
      <FilterChips chips={chips} />
      <RefreshableList
        data={reports}
        emptyMessage="Não há reports para listar."
        errorMessage={errorMessage}
        isError={!canLoadReports || qualityReportQuery.isError}
        isLoading={qualityReportQuery.isLoading}
        isRefreshing={refresh}
        keyExtractor={(item) => String(item.id)}
        loadingLabel="Carregando paletes"
        onRefresh={refreshReports}
        renderItem={({ item }) => <QualityReportCard item={item} reportType={reportType} />}
      />
      <WrapperPagination>
        <PaginationComponent />
      </WrapperPagination>
    </ListScreenShell>
  );
}
