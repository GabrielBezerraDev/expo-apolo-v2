import { FramedCameraScanner } from "@features/camera";
import { ExitExtraEvidence, FormScreenRoadmap, OperationSuccess, OperationSyncError, PalletsEvidence } from "@features/pallets";
import { MainTabsNavigator } from "@navigation/MainTabsNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootHeader } from "./RootHeader";

export const DefaultStack = ({ Stack }: { Stack: ReturnType<typeof createNativeStackNavigator> })  => {
  return (
    <RootHeader Stack={Stack}>
      <Stack.Screen name="Main" component={MainTabsNavigator} />
      <Stack.Screen
        name="Manual"
        getComponent={() =>
          require("@features/manual/screens/ManualScreen/ManualScreen")
            .ManualScreen
        }
      />
      <Stack.Screen name="FormScreenRoadmap" component={FormScreenRoadmap} />
      <Stack.Screen name="PalletsEvidence" component={PalletsEvidence} />
      <Stack.Screen name="ExitExtraEvidence" component={ExitExtraEvidence} />
      <Stack.Screen
        name="PalletOperationSummary"
        getComponent={() =>
          require("@features/pallets/screens/summary/PalletOperationSummary/PalletOperationSummary")
            .PalletOperationSummary
        }
      />
      <Stack.Screen
        name="PalletHistory"
        getComponent={() =>
          require("@features/pallets/screens/details/PalletHistoryScreen/PalletHistoryScreen")
            .PalletHistoryScreen
        }
      />
      <Stack.Screen
        name="PalletPhotos"
        getComponent={() =>
          require("@features/pallets/screens/details/PalletPhotosScreen/PalletPhotosScreen")
            .PalletPhotosScreen
        }
      />
      <Stack.Screen
        name="RoadmapPhotos"
        getComponent={() =>
          require("@features/pallets/screens/roadmap/RoadmapPhotosScreen/RoadmapPhotosScreen")
            .RoadmapPhotosScreen
        }
      />
      <Stack.Screen
        name="OperationSuccess"
        component={OperationSuccess}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OperationSyncError"
        component={OperationSyncError}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Scanner"
        component={FramedCameraScanner}
        options={{ headerShown: false }}
      />

    </RootHeader>
  );
};
