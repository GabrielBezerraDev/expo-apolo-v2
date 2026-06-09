import React, { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera, X } from "lucide-react-native";
import { Button, Image, ScrollView, styled, Text, useWindowDimensions, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useFrame } from "@features/camera";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { AppButton } from "@shared/components/Forms/AppButton";
import { typography } from "@shared/typography";
import { ListScreenShell } from "../../../components/ListScreenShell";
import { useOfflinePalletOperation } from "../../../hooks/useOfflinePalletOperation";
import { usePallet } from "../../../providers/PalletProvider";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type EvidenceKey = "licensePlate" | "seal";

export function ExitExtraEvidence() {
  const navigation = useNavigation<Navigation>();
  const { configureScanner } = useFrame();
  const { theme } = useThemeMode();
  const { height, width } = useWindowDimensions();
  const { exitExtraEvidencePhotos, resetEntry, route } = usePallet();
  const { persistExitExtraEvidencePhoto, saveExitExtraEvidenceDraft } = useOfflinePalletOperation();
  const photoWidth = width - width * 0.1;
  const photoHeight = height * 0.3;
  const canFinishExit = Boolean(exitExtraEvidencePhotos.licensePlate && exitExtraEvidencePhotos.seal);

  const scanPhoto = useCallback((photoKey: EvidenceKey) => {
    configureScanner({
      mode: "photo",
      preset: "fullScreen",
      orientation: "LandScape",
      onCapture: async (data) => {
        await persistExitExtraEvidencePhoto(photoKey, data.imageUri);
        navigation.goBack();
      },
      onCancel: () => navigation.goBack(),
    });
    navigation.navigate("Scanner");
  }, [configureScanner, navigation, persistExitExtraEvidencePhoto]);

  const closeExit = () => {
    resetEntry();
    navigation.navigate("Main");
  };

  const finishExit = async () => {
    await saveExitExtraEvidenceDraft({ currentStep: "completed", status: "pending_sync" });
    navigation.navigate("OperationSuccess", { operation: "exit" });
  };

  return (
    <ListScreenShell title="Evidências finais">
      <ScrollView contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
        <Header>
          <View>
            <Title>Roteiro: {route}</Title>
            <HelperText>Tire uma foto da placa e uma do lacre do caminhão.</HelperText>
          </View>
          <IconButton onPress={closeExit} hitSlop={10}>
            <X size={24} color={theme.mutedText} />
          </IconButton>
        </Header>

        <PhotoSlot
          title="Foto da placa"
          helper="Placa do caminhão"
          uri={exitExtraEvidencePhotos.licensePlate}
          width={photoWidth}
          height={photoHeight}
          iconColor={theme.primary}
          onPress={() => scanPhoto("licensePlate")}
        />

        <PhotoSlot
          title="Foto do lacre"
          helper="Lacre do caminhão"
          uri={exitExtraEvidencePhotos.seal}
          width={photoWidth}
          height={photoHeight}
          iconColor={theme.primary}
          onPress={() => scanPhoto("seal")}
        />

        <AppButton
          style={{ width: "100%", height: height * 0.06 }}
          title="FINALIZAR SAÍDA"
          disabled={!canFinishExit}
          onPress={finishExit}
        />
      </ScrollView>
    </ListScreenShell>
  );
}

type PhotoSlotProps = {
  height: number;
  helper: string;
  iconColor: string;
  onPress: () => void;
  title: string;
  uri: string | null;
  width: number;
};

function PhotoSlot({ height, helper, iconColor, onPress, title, uri, width }: PhotoSlotProps) {
  return (
    <PhotoButton onPress={onPress} width={width} height={height}>
      {uri ? (
        <PhotoImage source={{ uri }} resizeMode="cover" />
      ) : (
        <PhotoEmpty>
          <Camera size={34} color={iconColor} />
          <PhotoTitle>{title}</PhotoTitle>
          <HelperText>{helper}</HelperText>
          <HelperText>TOQUE PARA FOTOGRAFAR</HelperText>
        </PhotoEmpty>
      )}
    </PhotoButton>
  );
}

const contentStyle = {
  alignItems: "center" as const,
  gap: 16,
  paddingBottom: 36,
  paddingVertical: 18,
};

const Header = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
});

const Title = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
});

const HelperText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
});

const PhotoButton = styled(Button, {
  unstyled: true,
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  overflow: "hidden",
});

const PhotoImage = styled(Image, {
  height: "100%",
  width: "100%",
});

const PhotoEmpty = styled(View, {
  alignItems: "center",
  flex: 1,
  gap: 8,
  justifyContent: "center",
});

const PhotoTitle = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "800",
});

const IconButton = styled(Button, {
  unstyled: true,
});
