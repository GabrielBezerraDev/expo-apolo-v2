import React from "react";
import { styled, Text, View } from "tamagui";
import { AppCard } from "../../../shared/components/AppCard";
import { typography } from "../../../shared/typography";
import { PalletItem } from "../mocks/palletMock";

const Header = styled(View, {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
});
const HeaderText = styled(Text, {
  ...typography.bodyMedium,
  color: "$white",
  fontWeight: "800",
});
const Badge = styled(Text, {
  ...typography.label,
  color: "$primary",
  backgroundColor: "$white",
  borderRadius: 999,
  paddingVertical: 5,
  paddingHorizontal: 9,
  overflow: "hidden",
});
const Line = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  marginBottom: 7,
});
const Action = styled(Text, {
  ...typography.button,
  color: "$primary",
  marginTop: 8,
});

export function PalletCard({ item }: { item: PalletItem }) {
  return (
    <AppCard
      variant="orangeHeader"
      header={
        <Header>
          <HeaderText>{item.dateTime}</HeaderText>
          <Badge>{item.stage}</Badge>
        </Header>
      }
    >
      <Line>Variante: {item.variant}</Line>
      <Line>Quantidade: {item.quantity}</Line>
      <Line>BATCH: {item.batch}</Line>
      <Line>Linha: {item.line}</Line>
      <Action>OPÇÕES</Action>
    </AppCard>
  );
}
