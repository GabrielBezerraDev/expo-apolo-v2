import React from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { X } from "lucide-react-native";
import {
  DrawerCloseButton,
  DrawerHeader,
  DrawerItem,
  DrawerItemText,
  DrawerPanel,
  DrawerSubtitle,
  DrawerTitle,
} from "./styled";
import { useAppDrawer } from "./useAppDrawer";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AppDrawer({ visible, onClose }: Props) {
  const { backdropStyle, closeDrawer, handleLogout, panelStyle, theme } = useAppDrawer({ onClose, visible });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeDrawer}>
      <Animated.View style={[styles.backdrop, { backgroundColor: "rgba(0, 0, 0, 0.45)" }, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />

        <Animated.View style={[styles.panelWrapper, panelStyle]}>
          <DrawerPanel>
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
              <DrawerCloseButton onPress={closeDrawer} hitSlop={8}>
                <X size={22} color={theme.text} />
              </DrawerCloseButton>
            </DrawerHeader>

            <DrawerSubtitle>Atalhos do sistema</DrawerSubtitle>

            <DrawerItem>
              <DrawerItemText>Perfil</DrawerItemText>
            </DrawerItem>
            <DrawerItem>
              <DrawerItemText>Configurações</DrawerItemText>
            </DrawerItem>
            <DrawerItem onPress={handleLogout}>
              <DrawerItemText>Sair</DrawerItemText>
            </DrawerItem>
          </DrawerPanel>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
  },
  panelWrapper: {
    height: "100%",
    width: "78%",
    maxWidth: 320,
  },
});
