import React from "react";
import { X } from "lucide-react-native";
import { Button, styled } from "tamagui";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";

type Props = {
  onPress: () => void;
};

export function MovementCancelButton({ onPress }: Props) {
  const { theme } = useThemeMode();

  return (
    <CancelButton onPress={onPress} hitSlop={10}>
      <X size={24} color={theme.error} />
    </CancelButton>
  );
}

const CancelButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "$card",
  borderColor: "$error",
  borderRadius: 999,
  borderWidth: 1,
  height: 50,
  justifyContent: "center",
  shadowColor: "$black",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.18,
  shadowRadius: 10,
  width: 50,
});
