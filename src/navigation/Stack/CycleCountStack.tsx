import {
  InventoryBinCountScreen,
  InventoryCountProvider,
  InventoryListScreen,
  InventoryScanAudioProvider,
  NewInventoryCountScreen,
} from "@features/inventoryCount";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootHeader } from "./RootHeader";

export const CycleCountStack = ({
  Stack,
}: {
  Stack: ReturnType<typeof createNativeStackNavigator>;
}) => {
  return (
    <InventoryScanAudioProvider>
      <InventoryCountProvider>
        <RootHeader Stack={Stack}>
          <Stack.Screen name="InventoryList" component={InventoryListScreen} />
          <Stack.Screen
            name="NewInventoryCount"
            component={NewInventoryCountScreen}
          />
          <Stack.Screen
            name="InventoryBinCount"
            component={InventoryBinCountScreen}
          />
          <Stack.Screen
            name="Manual"
            getComponent={() =>
              require("@features/manual/screens/ManualScreen/ManualScreen")
                .ManualScreen
            }
          />
        </RootHeader>
      </InventoryCountProvider>
    </InventoryScanAudioProvider>
  );
};
