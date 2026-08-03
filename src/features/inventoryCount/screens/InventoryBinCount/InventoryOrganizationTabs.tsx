import React from "react";
import { Button, styled, Text, XStack } from "tamagui";
import { buttonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";
import type { InventoryOrganizationMode } from "./inventoryMaterialGrouping";

type Props = {
  onChange: (value: InventoryOrganizationMode) => void;
  value: InventoryOrganizationMode;
};

const OPTIONS: Array<{
  label: string;
  value: InventoryOrganizationMode;
}> = [
  { label: "Etiqueta", value: "labelId" },
  { label: "Lote", value: "lot" },
  { label: "Material", value: "materialCode" },
];

export function InventoryOrganizationTabs({ onChange, value }: Props) {
  return (
    <TabsRoot accessibilityRole="tablist">
      {OPTIONS.map(option => {
        const active = option.value === value;

        return (
          <TabButton
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            active={active}
            onPress={() => onChange(option.value)}
          >
            <TabText active={active}>{option.label}</TabText>
          </TabButton>
        );
      })}
    </TabsRoot>
  );
}

const TabsRoot = styled(XStack, {
  gap: 8,
});

const TabButton = styled(Button, {
  alignItems: "center",
  borderColor: "$primary",
  borderRadius: 14,
  borderWidth: 1,
  flex: 1,
  justifyContent: "center",
  minHeight: 44,
  paddingHorizontal: 8,
  pressStyle: buttonPressStyle,
  unstyled: true,
  variants: {
    active: {
      false: { backgroundColor: "$card" },
      true: { backgroundColor: "$primary" },
    },
  } as const,
});

const TabText = styled(Text, {
  ...typography.label,
  textAlign: "center",
  variants: {
    active: {
      false: { color: "$primary" },
      true: { color: "$white" },
    },
  } as const,
});
