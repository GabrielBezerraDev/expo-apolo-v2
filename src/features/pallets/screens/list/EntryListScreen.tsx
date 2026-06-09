import React, { useCallback } from "react";
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
import { usePallet } from "../../providers/PalletProvider";
import { OperationCard } from "../../components/OperationCard";
import { entryOperations } from "../../mocks/palletMock";
import { ListScreenShell } from "../../components/ListScreenShell";
import { useOperationListFilters } from "../../hooks/useOperationListFilters";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function EntryListScreen() {
  const navigation = useNavigation<Navigation>();
  const { resetEntry, setOperationPallet } = usePallet();
  const { setPaginationMeta } = usePagination();
  const {
    chips,
    openFilterModal,
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
      <RefreshableList
        data={entryOperations}
        emptyMessage="Não há entradas para listar."
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OperationCard item={item} />}
      />
      <WrapperPagination>
        <PaginationComponent />
      </WrapperPagination>
    </ListScreenShell>
  );
}
