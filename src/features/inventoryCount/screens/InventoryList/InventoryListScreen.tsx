import React, { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Filter, QrCode } from "lucide-react-native";
import { View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { FloatButton } from "@shared/components/Actions/FloatButton";
import { RefreshableList } from "@shared/components/Display";
import { FilterChips } from "@shared/components/Filters";
import { useAppHeaderConfig } from "@shared/components/Navigation/AppHeader";
import { InventoryCountCard } from "../../components";
import { useInventoryCount } from "../../providers";
import {
  filterInventoryCounts,
  useInventoryCountFilters,
} from "./useInventoryCountFilters";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function InventoryListScreen() {
  const navigation = useNavigation<Navigation>();
  const { counts, startCount } = useInventoryCount();
  const { appliedFilters, chips, hasFilters, openFilterModal } =
    useInventoryCountFilters();
  const visibleCounts = useMemo(
    () => filterInventoryCounts(counts, appliedFilters),
    [appliedFilters, counts],
  );

  useAppHeaderConfig({ title: "Contagens cíclicas" });

  const startNewCount = () => {
    startCount();
    navigation.navigate("NewInventoryCount");
  };

  return (
    <View flex={1} backgroundColor="$background">
      <View flex={1} gap={14} paddingHorizontal={12} paddingTop={12}>
        <FilterChips chips={chips} />
        <RefreshableList
          data={visibleCounts}
          emptyMessage={
            hasFilters
              ? "Nenhuma contagem corresponde aos filtros selecionados."
              : "Nenhuma contagem cíclica foi registrada."
          }
          keyExtractor={item => item.id}
          renderItem={({ item }) => <InventoryCountCard item={item} />}
          contentContainerStyle={{ paddingBottom: 110 }}
        />
      </View>
      <FloatButton
        bottom={24}
        actions={[
          {
            Icon: QrCode,
            label: "Nova contagem",
            onPress: startNewCount,
          },
          { Icon: Filter, label: "Filtro", onPress: openFilterModal },
        ]}
      />
    </View>
  );
}
