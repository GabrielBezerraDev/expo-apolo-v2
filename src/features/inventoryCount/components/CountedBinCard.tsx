import React from "react";
import { MapPin } from "lucide-react-native";
import { styled, Text, View, XStack } from "tamagui";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { typography } from "@shared/typography";
import type { CountedInventoryBin } from "../protocol";

export function CountedBinCard({ bin }: { bin: CountedInventoryBin }) {
  const { theme } = useThemeMode();
  const totalQuantity = bin.materials.reduce(
    (total, material) => total + material.quantity,
    0,
  );

  return (
    <CardRoot>
      <BinHeader>
        <BinIdentity>
          <MapPin size={22} color={theme.primary} />
          <View>
            <Label>BIN CONTADO</Label>
            <Address>{bin.address}</Address>
          </View>
        </BinIdentity>
        <CompletedText>Concluído</CompletedText>
      </BinHeader>
      <Summary>
        <SummaryText>{bin.materials.length} etiquetas</SummaryText>
        <SummaryDivider />
        <SummaryText>
          {totalQuantity.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} unidades
        </SummaryText>
      </Summary>
    </CardRoot>
  );
}

const CardRoot = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 18,
  borderWidth: 1,
  gap: 13,
  padding: 15,
});

const BinHeader = styled(XStack, {
  alignItems: "center",
  gap: 10,
  justifyContent: "space-between",
});

const BinIdentity = styled(XStack, {
  alignItems: "center",
  flex: 1,
  gap: 9,
});

const Label = styled(Text, {
  ...typography.label,
  color: "$mutedText",
});

const Address = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
});

const CompletedText = styled(Text, {
  ...typography.label,
  color: "$success",
  fontWeight: "700",
});

const Summary = styled(XStack, {
  alignItems: "center",
  gap: 9,
});

const SummaryText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

const SummaryDivider = styled(View, {
  backgroundColor: "$border",
  borderRadius: 999,
  height: 4,
  width: 4,
});
