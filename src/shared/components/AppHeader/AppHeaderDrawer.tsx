import React, { useEffect } from "react";
import { Modal, Pressable, StyleSheet } from "react-native";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { X } from "lucide-react-native";
import { useThemeMode } from "@hooks/useThemeMode";
import {
  DrawerCloseButton,
  DrawerHeader,
  DrawerItem,
  DrawerItemText,
  DrawerPanel,
  DrawerSubtitle,
  DrawerTitle,
} from "./styled";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AppHeaderDrawer({ visible, onClose }: Props) {
  const { theme } = useThemeMode();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withTiming(1, { duration: 240 });
    }
  }, [progress, visible]);

  const closeDrawer = () => {
    progress.value = withTiming(0, { duration: 180 }, finished => {
      if (finished) runOnJS(onClose)();
    });
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 320 * (1 - progress.value) }],
  }));

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
            <DrawerItem>
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
