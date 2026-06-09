import React, { useDeferredValue, useEffect, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { Search, SlidersHorizontal, X } from "lucide-react-native";
import { styled, Text, View } from "tamagui";
import {
  PaginationComponent,
  usePagination,
  WrapperPagination,
} from "@shared/components/Navigation/Pagination";
import { FilterChips } from "@shared/components/Filters";
import { AppInput } from "@shared/components/Forms/AppInput";
import { LottieAnimLoading } from "@shared/components/Feedback";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import { typography } from "@shared/typography";
import { ListScreenShell } from "../../components/ListScreenShell";
import { PalletReportStatusTabs } from "../../components/PalletReportStatusTabs";
import { QualityReportCard } from "../../components/QualityReportCard";
import { usePalletListFilters } from "../../hooks/usePalletListFilters";
import { useQualityReportList } from "../../hooks/useQualityReportList";
import { PalletReportType, QualityReport } from "../../types/qualityReport";

const FeedbackRoot = styled(View, {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 24,
  gap: 10,
});

const FeedbackText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  textAlign: "center",
});

const ErrorText = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
  textAlign: "center",
});

export function PalletListScreen() {
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
        leftIcon={<Search size={22} color="#ff6200" />}
        rightIcon={
          batchSearch ? (
            <Pressable onPress={() => setBatchSearch("")} hitSlop={10}>
              <X size={22} color="#ff6200" />
            </Pressable>
          ) : null
        }
      />
      <PalletReportStatusTabs value={reportType} onChange={setReportType} />
      <FilterChips chips={chips} />
      {renderContent()}
      <WrapperPagination>
        <PaginationComponent />
      </WrapperPagination>
    </ListScreenShell>
  );

  function renderContent() {
    if (!hasApiBaseUrl()) {
      return (
        <FeedbackRoot>
          <ErrorText>Configure EXPO_PUBLIC_API_URL para carregar os reports.</ErrorText>
        </FeedbackRoot>
      );
    }

    if (qualityReportQuery.isLoading || qualityReportQuery.isFetching) {
      return (
        <FeedbackRoot>
          <LottieAnimLoading label="Carregando paletes" />
        </FeedbackRoot>
      );
    }

    if (qualityReportQuery.isError) {
      return (
        <FeedbackRoot>
          <ErrorText>{qualityReportQuery.error.message}</ErrorText>
        </FeedbackRoot>
      );
    }

    if (reports.length === 0) {
      return (
        <FeedbackRoot>
          <FeedbackText>Não há reports para listar.</FeedbackText>
        </FeedbackRoot>
      );
    }

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 14, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {reports.map(item => (
          <QualityReportCard key={item.id} item={item} reportType={reportType} />
        ))}
      </ScrollView>
    );
  }
}
