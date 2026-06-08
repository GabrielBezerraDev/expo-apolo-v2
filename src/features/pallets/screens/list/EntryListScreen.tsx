import React, { useCallback, useEffect } from "react";
import { ScrollView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ClipboardPlus, Filter } from "lucide-react-native";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { PaginationComponent, usePagination } from "@shared/components/Navigation/Pagination";
import { FilterChips } from "@shared/components/Filters";
import { usePallet } from "../../providers/PalletProvider";
import { OperationCard } from "../../components/OperationCard";
import { entryOperations } from "../../mocks/palletMock";
import { ListScreenShell } from "../../components/ListScreenShell";
import { WrapperPagination } from "@shared/components/Navigation/Pagination";
import { useOperationListFilters } from "../../hooks/useOperationListFilters";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function EntryListScreen() {
  const navigation = useNavigation<Navigation>();
  const { resetEntry, setOperationPallet } = usePallet();
  const { setPaginationMeta } = usePagination();
  const {
    chips,
    openFilterModal,
    appliedFilters
  } = useOperationListFilters({ data: entryOperations, modalTitle: "Filtrar entradas" });

  useFocusEffect(
    useCallback(() => {
      setPaginationMeta({
        currentPage: 1,
        lastPage: 1,
        totalItems: entryOperations.length,
      });
    }, [setPaginationMeta]),
  );

  const startEntry = () => {
    resetEntry();
    setOperationPallet("entry");
    navigation.navigate("FormScreenPallet");
  };

  useEffect(() => {
    console.log("FILTROS", appliedFilters);
  }, [appliedFilters])

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
      <FilterChips chips={chips} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 14, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {entryOperations.map((item) => (
          <OperationCard key={item.id} item={item} />
        ))}
      </ScrollView>
      <WrapperPagination>
        <PaginationComponent />
      </WrapperPagination>
    </ListScreenShell>
  );
}
