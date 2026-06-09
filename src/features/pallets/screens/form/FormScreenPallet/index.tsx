import React, { useCallback, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Camera } from "lucide-react-native";
import { Button, styled, Text, useWindowDimensions, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { useFrame } from "@features/camera";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { AppButton } from "@shared/components/Forms/AppButton";
import { AppInput } from "@shared/components/Forms/AppInput";
import { fontScale, typography } from "@shared/typography";
import { usePallet } from "../../../providers/PalletProvider";
import { ListScreenShell } from "../../../components/ListScreenShell";
import { FormScreenPalletType } from './FormScreenPalletType';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function FormScreenPallet() {
  const navigation = useNavigation<Navigation>();
  const { configureScanner } = useFrame();
  const { theme } = useThemeMode();
  const {
    route,
    palletQuantity,
    setPalletQuantity,
    startPalletCapture,
    resetEntry,
    controlFormScreenPallet,
    isValidFormScreenPalletValue,
    setFormScreenPalletValue,
  } = usePallet();



  const navigator = useNavigation();
  const { height } = useWindowDimensions();
  const scanRoadmap = useCallback(() => {
    configureScanner({
      mode: "scanner",
      preset: "tinyDataLandScape",
      orientation: "LandScape",
      onCapture: (data) => {
        setFormScreenPalletValue("roadmap", data.text, {
          shouldValidate: true,
        });
        navigation.goBack();
      },
      onCancel: () => navigator.goBack(),
      formatTextDataWithRegex: (data) => data.replace(/[^a-zA-Z0-9\s]/g, ""),
    });
    navigation.navigate('Scanner');
  }, [configureScanner, navigation, navigator, setFormScreenPalletValue]);

  const formSubtitle = useMemo(() => {
    if (!route) return "Escaneie o roteiro e informe a quantidade de pallets.";
    return `Roteiro ${route}`;
  }, [route]);

  const confirm = () => {
    if (!startPalletCapture()) return;
    navigation.navigate("PalletsEvidence");
  };

  const cancel = () => {
    resetEntry();
    navigation.goBack();
  };

  return (
    <ListScreenShell title="Nova entrada">
      <FormScreenRoot>
        <Panel>
          <PanelHeader>
            <PanelHeaderText>NOVA ENTRADA</PanelHeaderText>
          </PanelHeader>
          <FormBody>
            <HelperText>
              {formSubtitle}
            </HelperText>
            <AppInput<FormScreenPalletType>
              controllerReactFormsProps={{
                name: "roadmap",
                control: controlFormScreenPallet,
                
              }}
              label="Roteiro"
              value={route}
              editable={false}
              placeholder="Escaneie o roteiro"
              rightIcon={
                <IconButton onPress={scanRoadmap} hitSlop={10}>
                  <Camera size={20 * fontScale} color={theme.primary} />
                </IconButton>
              }
            />
            <AppInput<FormScreenPalletType>
              controllerReactFormsProps={{
                name: "palletsQuantity",
                control: controlFormScreenPallet,
              }}
              label="Quan. de pallets"
              value={palletQuantity}
              onChangeText={(value) =>
                setPalletQuantity(value.replace(/[^0-9]/g, ""))
              }
              keyboardType="number-pad"
              placeholder="Ex: 2"
            />
            <AppButton
              style={{width:'100%', height: height * 0.06}}
              title="CONFIRMAR"
              disabled={!isValidFormScreenPalletValue}
              onPress={confirm}
            />
            <AppButton title="CANCELAR" variant="outline" onPress={cancel} />
          </FormBody>
        </Panel>
      </FormScreenRoot>
    </ListScreenShell>
  );
}

const FormScreenRoot = styled(View, {
  alignItems: "center",
  flex: 1,
  justifyContent: "center",
});

const Panel = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  maxWidth: 560,
  minHeight: 560,
  overflow: "hidden",
  width: "100%",
});

const PanelHeader = styled(View, {
  alignItems: "center",
  backgroundColor: "$primary",
  justifyContent: "center",
  minHeight: 44,
});

const PanelHeaderText = styled(Text, {
  ...typography.button,
  color: "$white",
});

const FormBody = styled(View, {
  gap: 16,
  justifyContent: "center",
  padding: 18,
  paddingTop: 48,
});

const HelperText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

const IconButton = styled(Button, {
  unstyled: true,
});
