import React, { useCallback, useMemo } from "react";
import { ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SlidersHorizontal } from "lucide-react-native";
import {
  PaginationComponent,
  usePagination,
  WrapperPagination,
} from "@shared/components/Navigation/Pagination";
import { FilterChips } from "@shared/components/Filters";
import { PalletCard } from "../../components/PalletCard";
import { palletItems } from "../../mocks/palletMock";
import { ListScreenShell } from "../../components/ListScreenShell";
import { usePalletListFilters } from "../../hooks/usePalletListFilters";

export function PalletListScreen() {
  const { setPaginationMeta } = usePagination();
  const listedPalletItems = useMemo(() => [...palletItems, ...palletItems], []);
  const {
    chips,
    openFilterModal,
  } = usePalletListFilters({ data: listedPalletItems, modalTitle: "Filtrar paletes" });

  useFocusEffect(
    useCallback(() => {
      setPaginationMeta({
        currentPage: 1,
        lastPage: 1,
        totalItems: listedPalletItems.length,
      });
    }, [listedPalletItems.length, setPaginationMeta]),
  );

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
      <FilterChips chips={chips} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 14, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {listedPalletItems.map((item, index) => (
          <PalletCard key={index} item={item} />
        ))}
      </ScrollView>
      <WrapperPagination>
        <PaginationComponent />
      </WrapperPagination>
    </ListScreenShell>
  );
}
