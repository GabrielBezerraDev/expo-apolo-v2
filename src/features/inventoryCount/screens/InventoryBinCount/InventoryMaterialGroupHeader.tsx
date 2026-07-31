import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Button, styled, Text, View } from "tamagui";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";
import type { InventoryOrganizationMode } from "./inventoryMaterialGrouping";

type Props = {
  expanded: boolean;
  itemCount: number;
  kind: Exclude<InventoryOrganizationMode, "labelId">;
  onPress: () => void;
  title: string;
  totalQuantity: number;
};

export function InventoryMaterialGroupHeader({
  expanded,
  itemCount,
  kind,
  onPress,
  title,
  totalQuantity,
}: Props) {
  const { theme } = useThemeMode();
  const ChevronIcon = expanded ? ChevronUp : ChevronDown;

  return (
    <GroupButton
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      expanded={expanded}
      onPress={onPress}
    >
      <GroupDescription>
        <GroupType>{kind === "lot" ? "LOTE" : "MATERIAL"}</GroupType>
        <GroupTitle numberOfLines={1}>{title}</GroupTitle>
        <GroupSummary>
          {itemCount} etiqueta(s) · {formatQuantity(totalQuantity)} unidades
        </GroupSummary>
      </GroupDescription>
      <ChevronIcon size={22} color={theme.primary} strokeWidth={2.4} />
    </GroupButton>
  );
}

const GroupButton = styled(Button, {
  alignItems: "center",
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  flexDirection: "row",
  gap: 12,
  justifyContent: "space-between",
  minHeight: 64,
  paddingHorizontal: 14,
  paddingVertical: 10,
  pressStyle: buttonPressStyle,
  unstyled: true,
  variants: {
    expanded: {
      false: { marginBottom: 0 },
      true: { marginBottom: 10 },
    },
  } as const,
});

const GroupDescription = styled(View, {
  flex: 1,
});

const GroupType = styled(Text, {
  ...typography.label,
  color: "$primary",
  fontWeight: "700",
});

const GroupTitle = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "700",
});

const GroupSummary = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

function formatQuantity(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}
