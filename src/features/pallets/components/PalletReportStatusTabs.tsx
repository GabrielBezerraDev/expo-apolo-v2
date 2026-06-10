import React from "react";
import { Button, styled, Text, View } from "tamagui";
import { typography } from "@shared/typography";
import { PalletReportType } from "../types/qualityReport";

type Props = {
  value: PalletReportType;
  onChange: (value: PalletReportType) => void;
};

const reportTypeOptions: { label: string; value: PalletReportType }[] = [
  { label: "Liberado", value: "releasedPallet" },
  { label: "Em espera", value: "onHoldPallet" },
  { label: "Rejeitado", value: "lockedPallet" },
];

const Root = styled(View, {
  flexDirection: "row",
  gap: 8,
});

const TabButton = styled(Button, {
  unstyled: true,
  flex: 1,
  minHeight: 44,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "$primary",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 10,
  variants: {
    active: {
      true: { backgroundColor: "$primary" },
      false: { backgroundColor: "$card" },
    },
  } as const,
});

const TabText = styled(Text, {
  ...typography.label,
  textAlign: "center",
  variants: {
    active: {
      true: { color: "$white" },
      false: { color: "$primary" },
    },
  } as const,
});

export function PalletReportStatusTabs({ onChange, value }: Props) {
  return (
    <Root>
      {reportTypeOptions.map(option => {
        const active = option.value === value;

        return (
          <TabButton key={option.value} active={active} onPress={() => onChange(option.value)}>
            <TabText active={active}>{option.label}</TabText>
          </TabButton>
        );
      })}
    </Root>
  );
}
