import React, { useCallback } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView, styled, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useAppHeaderConfig } from "@shared/components/Navigation/AppHeader";
import { RoadmapPhotosContent } from "../../../components/RoadmapPhotosContent";

type Props = NativeStackScreenProps<RootStackParamList, "RoadmapPhotos">;

export function RoadmapPhotosScreen({ navigation, route }: Props) {
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  useAppHeaderConfig({
    title: "Fotos do roteiro",
    subtitle: `Roteiro ${route.params.roadmap.roadmap}`,
    showBack: true,
    onBack: goBack,
  });

  return (
    <Screen>
      <Content>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={contentStyle}>
          <RoadmapPhotosContent roadmap={route.params.roadmap} />
        </ScrollView>
      </Content>
    </Screen>
  );
}

const contentStyle = {
  paddingBottom: 28,
  paddingTop: 14,
};

const Screen = styled(View, {
  backgroundColor: "$background",
  flex: 1,
});

const Content = styled(View, {
  flex: 1,
  paddingHorizontal: 12,
});
