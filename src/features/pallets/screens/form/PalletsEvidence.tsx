import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera, X } from "lucide-react-native";
import { Text, View } from "tamagui";
import type { RootStackParamList } from "@config/navigation.protocol";
import { useFrame } from "@features/camera";
import { useThemeMode } from "@hooks/useThemeMode";
import { AppButton } from "@shared/components/AppButton";
import { AppInput } from "@shared/components/AppInput";
import { typography } from "@shared/typography";
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

    Alert.alert(
      "Entrada concluída",
      `${palletsQuantity.length} palete(s) capturados.`,
    );
    closeEntry();
  };

  return (
    <ListScreenShell title="Captura de paletes">
      <ScrollView
        contentContainerStyle={styles.palletsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.palletsHeader}>
          <View>
            <Text style={[styles.palletsTitle, { color: theme.text }]}>
              Roteiro: {route}
            </Text>
            <Text style={[styles.helperText, { color: theme.mutedText }]}>
              Preencha lote e 4 fotos de cada palete.
            </Text>
          </View>
          <Pressable onPress={closeEntry} hitSlop={10}>
            <X size={24} color={theme.mutedText} />
          </Pressable>
        </View>

        {palletsQuantity.map((pallet, palletIndex) => (
          <View
            key={palletIndex}
            style={[
              styles.palletCard,
              {
                borderColor: theme.border,
                backgroundColor: theme.card,
                width: cardWidth,
                height: height * 0.5,
              },
            ]}
          >
            <View style={styles.palletCardHeader}>
              <Text style={[styles.palletCardTitle, { color: theme.text }]}>
                Pallet {palletIndex + 1}/{palletsQuantity.length}
              </Text>
            </View>
            <FlatList
              horizontal
              pagingEnabled
              data={pallet.palletsPhotos}
              keyExtractor={(_, photoIndex) => `${photoIndex}`}
              showsHorizontalScrollIndicator={false}
              style={{ width: photoSlotWidth, height: height * 0.5 }}
              renderItem={({ item, index: photoIndex }) => (
                <Pressable
                  onPress={() => scanPhoto(palletIndex, photoIndex)}
                  style={[
                    styles.photoSlot,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                      width: photoSlotWidth,
                      height: height * 0.5,
                    },
                  ]}
                >
                  {item ? (
                    <Image
                      source={{ uri: item }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.photoEmpty,
                        { paddingBottom: height * 0.1 },
                      ]}
                    >
                      <Camera size={30} color={theme.primary} />
                      <Text
                        style={[styles.photoCounter, { color: theme.text }]}
                      >
                        {photoIndex + 1}/4
                      </Text>
                      <Text
                        style={[styles.helperText, { color: theme.mutedText }]}
                      >
                        Toque para fotografar
                      </Text>
                    </View>
                  )}
                </Pressable>
              )}
            />
            <AppInput
              label="Escanear lote"
              value={pallet.batch}
              editable={false}
              placeholder="Escaneie o lote"
              rightIcon={
                <Pressable onPress={() => scanLot(palletIndex)} hitSlop={10}>
                  <Camera size={20} color={theme.primary} />
                </Pressable>
              }
            />
          </View>
        ))}

        <AppButton
          title={operationPallet === "exit" ? "CONTINUAR" : "CONFIRMAR"}
          disabled={!validateForm}
          onPress={finishEntry}
        />
      </ScrollView>
    </ListScreenShell>
  );
}

const styles = StyleSheet.create({
  helperText: {
    ...typography.bodySmall,
  },
  palletsContent: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 18,
    paddingBottom: 36,
  },
  palletsHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  palletsTitle: {
    ...typography.headingSmall,
  },
  palletCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  palletCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  palletCardTitle: {
    ...typography.bodyLarge,
    fontWeight: "800",
  },
  photoSlot: {
    height: 210,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoCounter: {
    fontSize: 42,
    fontWeight: "900",
  },
});
