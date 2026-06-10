import React, { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BaggageClaim, Filter } from "lucide-react-native";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import {
  PaginationComponent,
  usePagination,
  WrapperPagination,
} from "@shared/components/Navigation/Pagination";
import { FilterChips } from "@shared/components/Filters";
import { RefreshableList } from "@shared/components/Display";
import { OfflinePalletDraftList } from "../../components/OfflinePalletDraftList";
import { OperationCard } from "../../components/OperationCard";
import { OperationListTabs, OperationListTabValue } from "../../components/OperationListTabs";
import { exitOperations } from "../../mocks/palletMock";
import { ListScreenShell } from "../../components/ListScreenShell";
import { usePallet } from "../../providers/PalletProvider";
import { useOperationListFilters } from "../../hooks/useOperationListFilters";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function ExitListScreen() {
  const navigation = useNavigation<Navigation>();
  const [activeTab, setActiveTab] = useState<OperationListTabValue>("operations");
  const { resetEntry, setOperationPallet } = usePallet();
  const { setPaginationMeta } = usePagination();
  const {
    chips,
    openFilterModal,
  } = useOperationListFilters({ data: exitOperations, modalTitle: "Filtrar saídas" });

  useFocusEffect(
    useCallback(() => {
      setPaginationMeta({ currentPage: 1, lastPage: 1, totalItems: exitOperations.length });
    }, [setPaginationMeta]),
  );

  const startExit = () => {
    resetEntry();
    setOperationPallet("exit");
    navigation.navigate("FormScreenPallet");
  };

  return (
    <ListScreenShell
      title="Saídas"
      floatActions={[
        { Icon: BaggageClaim, label: "Nova Saída", onPress: startExit },
        { Icon: Filter, label: "Filtro", onPress: openFilterModal },
      ]}
    >
      <OperationListTabs value={activeTab} operationsLabel="Saídas" onChange={setActiveTab} />
      {activeTab === "drafts" ? (
        <OfflinePalletDraftList operationType="exit" />
      ) : (
        <>
          <FilterChips chips={chips} />
          <RefreshableList
            data={exitOperations}
            emptyMessage="Não há saídas para listar."
            keyExtractor={(item) => item.id}
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
