import { addZebraScanListener } from "@shared/services/nativeScanner";
import { useEffect } from "react";
import { Alert } from "react-native";
import { Text } from "tamagui";

export function InventoryListScreen() {
  useEffect(() => {
    const subscription = addZebraScanListener(
      result => {
        Alert.alert(JSON.stringify(result.data));
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return <Text>TESTE</Text>;
}
