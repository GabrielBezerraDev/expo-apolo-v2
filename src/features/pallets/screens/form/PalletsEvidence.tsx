import React, { useCallback, useState } from "react";
import {
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera, X } from "lucide-react-native";
import { Button, Image, ScrollView, styled, Text, useWindowDimensions, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useFrame } from "@features/camera";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { AppButton } from "@shared/components/Forms/AppButton";
import { AppInput } from "@shared/components/Forms/AppInput";
import { fontScale, typography } from "@shared/typography";
import { usePallet } from "../../providers/PalletProvider";
import { ListScreenShell } from "../../components/ListScreenShell";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function PalletsEvidence() {
  const navigation = useNavigation<Navigation>();
  const { configureScanner } = useFrame();
  const { theme } = useThemeMode();
  const { width, height } = useWindowDimensions();
  const { route, resetEntry, getValeusScreenPallet, operationPallet } = usePallet();
  const cardWidth = width - width * 0.1;
  const photoSlotWidth = cardWidth - 32;
  const [palletsQuantity, setPalletsQuantity] = useState(() =>
    Array.from(
      { length: Number(getValeusScreenPallet("palletsQuantity")) },
      () => ({
        palletsPhotos: ["", "", "", ""],
        batch: "",
      }),
    ),
  );
  

  const validateForm =
    palletsQuantity.length > 0 &&
    palletsQuantity.every(
      (pallet) => Boolean(pallet.batch) && pallet.palletsPhotos.every(Boolean),
    );

  const scanLot = useCallback(
    (palletIndex: number) => {
      configureScanner({
        mode: "scanner",
        preset: "tinyDataLandScape",
        orientation: "LandScape",
        onCapture: (data) => {
          setPalletsQuantity((prev) =>
            prev.map((pallet, index) => {
              if (index !== palletIndex) return pallet;

              return {
                ...pallet,
                batch: data.text,
              };
            }),
          );
          navigation.goBack();
        },
        onCancel: () => navigation.goBack(),
        formatTextDataWithRegex: (data) => data.replace(/\D/g, ""),
      });
      navigation.navigate("Scanner");
    },
    [configureScanner, navigation],
  );

  const scanPhoto = useCallback(
    (palletIndex: number, photoIndex: number) => {
      configureScanner({
        mode: "photo",
        preset: "fullScreen",
        orientation: "LandScape",
        onCapture: (data) => {
          setPalletsQuantity((palletsQuantity) => {
            palletsQuantity[palletIndex].palletsPhotos[photoIndex] =
              data.imageUri;
            return [...palletsQuantity];
          });
          navigation.goBack();
        },
        onCancel: () => navigation.goBack(),
      });
      navigation.navigate("Scanner");
    },
    [configureScanner, navigation],
  );

  const closeEntry = () => {
    resetEntry();
  };

  const finishEntry = () => {
    if (operationPallet === "exit") {
      navigation.navigate("ShipGoods");
      return;
    }

    navigation.navigate("OperationSuccess", { operation: "entry" });
  };

  return (
    <ListScreenShell title="Captura de paletes">
      <ScrollView
        contentContainerStyle={palletsContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <PalletsHeader>
          <View>
            <PalletsTitle>
              Roteiro: {route}
            </PalletsTitle>
            <HelperText>
              Preencha lote e 4 fotos de cada palete.
            </HelperText>
          </View>
          <IconButton onPress={closeEntry} hitSlop={10}>
            <X size={24} color={theme.mutedText} />
          </IconButton>
        </PalletsHeader>

        {palletsQuantity.map((pallet, palletIndex) => (
          <PalletCard
            key={palletIndex}
            width={cardWidth}
            height={height * 0.5}
          >
            <PalletCardHeader>
              <PalletCardTitle>
                Pallet {palletIndex + 1}/{palletsQuantity.length}
              </PalletCardTitle>
            </PalletCardHeader>
            <FlatList
              horizontal
              pagingEnabled
              data={pallet.palletsPhotos}
              keyExtractor={(_, photoIndex) => `${photoIndex}`}
              showsHorizontalScrollIndicator={false}
              style={{ width: photoSlotWidth, height: height * 0.5 }}
              renderItem={({ item, index: photoIndex }) => (
                <PhotoButton
                  onPress={() => scanPhoto(palletIndex, photoIndex)}
                  width={photoSlotWidth}
                  height={height * 0.5}
                >
                  {item ? (
                    <PhotoImage
                      source={{ uri: item }}
                      resizeMode="cover"
                    />
                  ) : (
                    <PhotoEmpty paddingBottom={height * 0.1}>
                      <Camera size={30} color={theme.primary} />
                      <PhotoCounter>
                        {photoIndex + 1}/4
                      </PhotoCounter>
                      <HelperText>
                        TOQUE PARA FOTOGRAFAR
                      </HelperText>
                    </PhotoEmpty>
                  )}
                </PhotoButton>
              )}
            />
            <AppInput
              label="Escanear lote"
              value={pallet.batch}
              editable={false}
              placeholder="Escaneie o lote"
              rightIcon={
                <IconButton onPress={() => scanLot(palletIndex)} hitSlop={10}>
                  <Camera size={20 * fontScale} color={theme.primary} />
                </IconButton>
              }
            />
          </PalletCard>
        ))}

        <AppButton
          style={{ width: "100%", height: height * 0.06 }}
          title={operationPallet === "exit" ? "CONTINUAR" : "CONFIRMAR"}
          disabled={!validateForm}
          onPress={finishEntry}
        />
      </ScrollView>
    </ListScreenShell>
  );
}

const palletsContentStyle = {
  alignItems: "center" as const,
  gap: 16,
  paddingBottom: 36,
  paddingVertical: 18,
};

const HelperText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "800",
});

const PalletsHeader = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
});

const PalletsTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
});

const PalletCard = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  gap: 14,
  padding: 16,
});

const PalletCardHeader = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "space-between",
});

const PalletCardTitle = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "800",
});

const PhotoButton = styled(Button, {
  unstyled: true,
  backgroundColor: "$background",
  borderColor: "$border",
  borderRadius: 14,
  borderWidth: 1,
  height: 210,
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

const PhotoCounter = styled(Text, {
  color: "$text",
  fontSize: 42,
  fontWeight: "900",
});

const IconButton = styled(Button, {
  unstyled: true,
});
