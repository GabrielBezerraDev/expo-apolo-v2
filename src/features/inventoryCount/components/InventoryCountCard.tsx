import React from "react";
import { CalendarDays, MapPinned, ScanBarcode, Sigma } from "lucide-react-native";
import { styled, Text, View, XStack } from "tamagui";
import { useThemeMode } from "@shared/components/Actions/ThemeToggle";
import { typography } from "@shared/typography";
import type { InventoryCount } from "../protocol";

export function InventoryCountCard({ item }: { item: InventoryCount }) {
  const { theme } = useThemeMode();
  const materialCount = item.bins.reduce(
    (total, bin) => total + bin.materials.length,
    0,
  );
  const totalQuantity = item.bins.reduce(
    (total, bin) =>
      total + bin.materials.reduce((binTotal, material) => binTotal + material.quantity, 0),
    0,
  );

  return (
    <CardRoot>
      <CardHeader>
        <View>
          <CardEyebrow>CONTAGEM CÍCLICA</CardEyebrow>
          <CardTitle>{formatDateTime(item.completedAt)}</CardTitle>
        </View>
        <StatusBadge>
          <StatusText>Finalizada</StatusText>
        </StatusBadge>
      </CardHeader>

      <StatsRow>
        <Stat>
          <MapPinned size={19} color={theme.primary} />
          <StatValue>{item.bins.length}</StatValue>
          <StatLabel>Bins</StatLabel>
        </Stat>
        <Stat>
          <ScanBarcode size={19} color={theme.primary} />
          <StatValue>{materialCount}</StatValue>
          <StatLabel>Etiquetas</StatLabel>
        </Stat>
        <Stat>
          <Sigma size={19} color={theme.primary} />
          <StatValue>{formatQuantity(totalQuantity)}</StatValue>
          <StatLabel>Quantidade</StatLabel>
        </Stat>
      </StatsRow>

      <DateRow>
        <CalendarDays size={17} color={theme.mutedText} />
        <DateText>Iniciada em {formatDateTime(item.startedAt)}</DateText>
      </DateRow>
    </CardRoot>
  );
}

const CardRoot = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 20,
  borderWidth: 1,
  gap: 16,
  padding: 16,
});

const CardHeader = styled(XStack, {
  alignItems: "center",
  gap: 12,
  justifyContent: "space-between",
});

const CardEyebrow = styled(Text, {
  ...typography.label,
  color: "$primary",
  fontWeight: "700",
});

const CardTitle = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
});

const StatusBadge = styled(View, {
  backgroundColor: "$success",
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 5,
});

const StatusText = styled(Text, {
  ...typography.label,
  color: "$white",
  fontWeight: "700",
});

const StatsRow = styled(XStack, {
  gap: 8,
});

const Stat = styled(View, {
  alignItems: "center",
  backgroundColor: "$surface",
  borderRadius: 14,
  flex: 1,
  gap: 2,
  minWidth: 82,
  paddingHorizontal: 6,
  paddingVertical: 10,
});

const StatValue = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "700",
});

const StatLabel = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

const DateRow = styled(XStack, {
  alignItems: "center",
  gap: 7,
});

const DateText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
});

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatQuantity(value: number) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 3 });
}
