import React from "react";
import { Button, styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";

export type OperationListTabValue = "operations" | "drafts";

type Props = {
  value: OperationListTabValue;
  operationsLabel: string;
  onChange: (value: OperationListTabValue) => void;
};

export function OperationListTabs({ onChange, operationsLabel, value }: Props) {
  return (
    <TabsRoot>
      <TabButton active={value === "operations"} onPress={() => onChange("operations")}>
        <TabText active={value === "operations"}>{operationsLabel}</TabText>
      </TabButton>
      <TabButton active={value === "drafts"} onPress={() => onChange("drafts")}>
        <TabText active={value === "drafts"}>Rascunhos</TabText>
      </TabButton>
    </TabsRoot>
  );
}

const TabsRoot = styled(View, {
  borderBottomColor: "$border",
  borderBottomWidth: 2,
  flexDirection: "row",
  marginBottom: 8,
});

const TabButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  borderBottomWidth: 3,
  flex: 1,
  paddingVertical: 12,
  variants: {
    active: {
      true: { borderBottomColor: "$primary" },
      false: { borderBottomColor: "transparent" },
    },
  } as const,
});

const TabText = styled(Text, {
  ...typography.bodyMedium,
  fontWeight: "700",
  variants: {
    active: {
      true: { color: "$primary" },
      false: { color: "$mutedText" },
    },
  } as const,
});
