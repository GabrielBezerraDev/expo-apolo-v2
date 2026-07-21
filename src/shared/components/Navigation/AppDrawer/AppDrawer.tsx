import React from "react";
import { Modal } from "react-native";
import Animated from "react-native-reanimated";
import { View } from "tamagui";
import { X } from "lucide-react-native";
import {
  DrawerBackdropButton,
  DrawerCloseButton,
  DrawerHeader,
  DrawerItem,
  DrawerItemText,
  DrawerPanel,
  DrawerSubtitle,
  DrawerTitle,
} from "./styled";
import { useAppDrawer } from "./useAppDrawer";

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AppDrawer({ visible, onClose }: Props) {
  const {
    backdropStyle,
    closeDrawer,
    handleLogout,
    handleOpenManual,
    panelStyle,
    theme,
  } = useAppDrawer({ onClose, visible });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeDrawer}>
      <AnimatedView style={[backdropStyleBase, { backgroundColor: "rgba(0, 0, 0, 0.45)" }, backdropStyle]}>
        <DrawerBackdropButton onPress={closeDrawer} />

        <AnimatedView style={[panelWrapperStyle, panelStyle]}>
          <DrawerPanel>
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
              <DrawerCloseButton onPress={closeDrawer} hitSlop={8}>
                <X size={22} color={theme.text} />
              </DrawerCloseButton>
            </DrawerHeader>

            <DrawerSubtitle>Atalhos do sistema</DrawerSubtitle>

            <DrawerItem onPress={handleOpenManual}>
              <DrawerItemText>Manual do Usuário</DrawerItemText>
            </DrawerItem>

            <DrawerItem onPress={handleLogout}>
              <DrawerItemText>Sair</DrawerItemText>
            </DrawerItem>
          </DrawerPanel>
        </AnimatedView>
      </AnimatedView>
    </Modal>
  );
}

const backdropStyleBase = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  alignItems: "flex-end" as const,
};

const panelWrapperStyle = {
  height: "100%" as const,
  width: "78%" as const,
  maxWidth: 320,
};
