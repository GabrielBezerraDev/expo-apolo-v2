import { InventoryListScreen } from "@features/inventoryCount";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootHeader } from "./RootHeader";

export const CycleCountStack = ({
  Stack,
}: {
  Stack: ReturnType<typeof createNativeStackNavigator>;
}) => {
  return (
    <RootHeader Stack={Stack}>
      <Stack.Screen name="InventoryList" component={InventoryListScreen} />
    </RootHeader>
  );
};
