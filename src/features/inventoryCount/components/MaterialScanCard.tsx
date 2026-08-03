import React from "react";
import { styled, Text, View, XStack } from "tamagui";
import { typography } from "@shared/typography";
import { formatInventoryDate } from "../services";
import type { ScannedMaterial } from "../protocol";

export function MaterialScanCard({ material }: { material: ScannedMaterial }) {
  return (
    <CardRoot>
      <CardHeader>
        <View flex={1}>
          <Label>MATERIAL</Label>
          <MaterialCode>{material.materialCode}</MaterialCode>
        </View>
        <QuantityBadge>
          <QuantityLabel>QTD.</QuantityLabel>
          <QuantityValue>
            {material.quantity.toLocaleString("pt-BR", {
              maximumFractionDigits: 3,
            })}
          </QuantityValue>
        </QuantityBadge>
      </CardHeader>
      <Details>
        <Detail>
          <DetailLabel>Lote</DetailLabel>
          <DetailValue>{material.lot}</DetailValue>
        </Detail>
        <Detail>
          <DetailLabel>Impressão</DetailLabel>
          <DetailValue>{formatInventoryDate(material.printedAt)}</DetailValue>
        </Detail>
        <Detail>
          <DetailLabel>Expiração</DetailLabel>
          <DetailValue>{formatInventoryDate(material.expiresAt)}</DetailValue>
        </Detail>
      </Details>
      <LabelId numberOfLines={1}>{material.labelId}</LabelId>
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

const CardHeader = styled(XStack, {
  alignItems: "center",
  gap: 12,
  justifyContent: "space-between",
});

const Label = styled(Text, {
  ...typography.label,
  color: "$mutedText",
});

const MaterialCode = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
});

const QuantityBadge = styled(View, {
  alignItems: "flex-end",
  backgroundColor: "$surface",
  borderRadius: 12,
  paddingHorizontal: 11,
  paddingVertical: 7,
});

const QuantityLabel = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

const QuantityValue = styled(Text, {
  ...typography.bodyLarge,
  color: "$primary",
  fontWeight: "700",
});

const Details = styled(XStack, {
  gap: 8,
});

const Detail = styled(View, {
  flex: 1,
  gap: 2,
});

const DetailLabel = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

const DetailValue = styled(Text, {
  ...typography.bodySmall,
  color: "$text",
  fontWeight: "600",
});

const LabelId = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});
