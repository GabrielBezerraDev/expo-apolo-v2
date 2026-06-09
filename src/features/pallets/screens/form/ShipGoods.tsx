import React, { useCallback } from "react";
import {
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Roteiro: {route}</Text>
            <Text style={[styles.helperText, { color: theme.mutedText }]}>Tire uma foto da barcada e uma da placa do caminhão.</Text>
          </View>
          <Pressable onPress={closeExit} hitSlop={10}>
            <X size={24} color={theme.mutedText} />
          </Pressable>
        </View>

        <PhotoSlot
          title="Foto da carga"
          helper="Mercadoria embarcada no caminhão"
          uri={shipGoodsPhotos.truck}
          width={photoWidth}
          height={photoHeight}
          borderColor={theme.border}
          backgroundColor={theme.card}
          iconColor={theme.primary}
          textColor={theme.text}
          mutedTextColor={theme.mutedText}
          onPress={() => scanPhoto("truck")}
        />

        <PhotoSlot
          title="Foto da placa"
          helper="Placa do caminhão"
          uri={shipGoodsPhotos.licensePlate}
          width={photoWidth}
          height={photoHeight}
          borderColor={theme.border}
          backgroundColor={theme.card}
          iconColor={theme.primary}
          textColor={theme.text}
          mutedTextColor={theme.mutedText}
          onPress={() => scanPhoto("licensePlate")}
        />

        <AppButton
          style={{width:'100%', height: height * 0.06}}
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
  borderColor: string;
  backgroundColor: string;
  iconColor: string;
  textColor: string;
  mutedTextColor: string;
  onPress: () => void;
};

function PhotoSlot({
  title,
  helper,
  uri,
  width,
  height,
  borderColor,
  backgroundColor,
  iconColor,
  textColor,
  mutedTextColor,
  onPress,
}: PhotoSlotProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.photoSlot,
        {
          borderColor,
          backgroundColor,
          width,
          height,
        },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoEmpty}>
          <Camera size={34} color={iconColor} />
          <Text style={[styles.photoTitle, { color: textColor }]}>{title}</Text>
          <Text style={[styles.helperText, { color: mutedTextColor }]}>{helper}</Text>
          <Text style={[styles.helperText, { color: mutedTextColor }]}>TOQUE PARA FOTOGRAFAR</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 18,
    paddingBottom: 36,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    ...typography.headingSmall,
  },
  helperText: {
    ...typography.bodySmall,
    fontWeight: '700'
  },
  photoSlot: {
    borderWidth: 1,
    borderRadius: 16,
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
  photoTitle: {
    ...typography.bodyLarge,
    fontWeight: "800",
  },
});
