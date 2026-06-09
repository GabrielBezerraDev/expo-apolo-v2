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
import { ListScreenShell } from "../../components/ListScreenShell";
import { usePallet } from "../../providers/PalletProvider";
import type { ShipGoodsPhotos } from "../../providers/PalletProvider";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function ShipGoods() {
  const navigation = useNavigation<Navigation>();
  const { configureScanner } = useFrame();
  const { theme } = useThemeMode();
  const { width, height } = useWindowDimensions();
  const { route, resetEntry, shipGoodsPhotos, setShipGoodsPhotos } = usePallet();
  const photoWidth = width - width * 0.1;
  const photoHeight = height * 0.34;
  const canFinishExit = Boolean(shipGoodsPhotos.truck && shipGoodsPhotos.licensePlate);

  const scanPhoto = useCallback((photoKey: keyof ShipGoodsPhotos) => {
    configureScanner({
      mode: "photo",
      preset: "fullScreen",
      orientation: "LandScape",
      onCapture: (data) => {
        setShipGoodsPhotos((current) => ({
          ...current,
          [photoKey]: data.imageUri,
        }));
        navigation.goBack();
      },
      onCancel: () => navigation.goBack(),
    });
    navigation.navigate("Scanner");
  }, [configureScanner, navigation, setShipGoodsPhotos]);

  const closeExit = () => {
    resetEntry();
    navigation.navigate("Main");
  };

  const finishExit = () => {
    navigation.navigate("OperationSuccess", { operation: "exit" });
  };

  return (
    <ListScreenShell title="Mercadoria embarcada">
      <ScrollView
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
      >
        <Header>
          <View>
            <Title>Roteiro: {route}</Title>
            <HelperText>Tire uma foto da barcada e uma da placa do caminhão.</HelperText>
          </View>
          <IconButton onPress={closeExit} hitSlop={10}>
            <X size={24} color={theme.mutedText} />
          </IconButton>
        </Header>

        <PhotoSlot
          title="Foto da carga"
          helper="Mercadoria embarcada no caminhão"
          uri={shipGoodsPhotos.truck}
          width={photoWidth}
          height={photoHeight}
          iconColor={theme.primary}
          onPress={() => scanPhoto("truck")}
        />

        <PhotoSlot
          title="Foto da placa"
          helper="Placa do caminhão"
          uri={shipGoodsPhotos.licensePlate}
          width={photoWidth}
          height={photoHeight}
          iconColor={theme.primary}
          onPress={() => scanPhoto("licensePlate")}
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
  title: string;
  helper: string;
  uri: string | null;
  width: number;
  height: number;
  iconColor: string;
  onPress: () => void;
};

function PhotoSlot({
  title,
  helper,
  uri,
  width,
  height,
  iconColor,
  onPress,
}: PhotoSlotProps) {
  return (
    <PhotoButton
      onPress={onPress}
      width={width}
      height={height}
    >
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
