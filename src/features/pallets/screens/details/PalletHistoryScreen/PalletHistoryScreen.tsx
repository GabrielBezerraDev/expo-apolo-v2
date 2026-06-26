import React, { useCallback, useMemo } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Button, ScrollView, styled, Text, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { LottieAnimLoading } from "@shared/components/Feedback";
import { useAppHeaderConfig } from "@shared/components/Navigation/AppHeader";
import { hasApiBaseUrl } from "@shared/services/apiClient";
import { primaryButtonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";
import type { PalletChangeHistory, PalletChangeHistoryUser } from "../../../protocol";
import { usePalletApi } from "../../../services";
import { getPalletStageLabel } from "../../../utils";

type Props = NativeStackScreenProps<RootStackParamList, "PalletHistory">;

const FIELD_LABELS: Record<string, string> = {
  currentStage: "Estágio Atual",
  quantity: "Quantidade",
  updatedAt: "Atualizado",
  variant: "Variante",
};

export function PalletHistoryScreen({ navigation, route }: Props) {
  const palletApi = usePalletApi();
  const canLoadHistory = hasApiBaseUrl() && palletApi.hasAuthToken;
  const historyQuery = useQuery({
    queryKey: ["pallet-history", route.params.palletId],
    queryFn: () => palletApi.getPalletHistoryByPalletId(route.params.palletId),
    enabled: canLoadHistory,
  });
  const history = useMemo(
    () => [...(historyQuery.data ?? [])].sort(sortHistoryByNewest),
    [historyQuery.data],
  );
  const batch = history[0]?.pallet?.batch ?? route.params.batch;
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  useAppHeaderConfig({
    title: "Histórico do palete",
    subtitle: batch ? `Lote ${batch}` : undefined,
    showBack: true,
    onBack: goBack,
  });

  return (
    <Screen>
      <Content>
        {historyQuery.isLoading || !canLoadHistory ? (
          <CenteredFrame>
            {canLoadHistory ? (
              <LottieAnimLoading label="Carregando histórico" />
            ) : (
              <ErrorText>Configure EXPO_PUBLIC_API_URL para carregar o histórico.</ErrorText>
            )}
          </CenteredFrame>
        ) : historyQuery.isError ? (
          <CenteredFrame>
            <ErrorText>{historyQuery.error.message}</ErrorText>
            <RetryButton onPress={() => { void historyQuery.refetch(); }}>
              <RetryButtonText>TENTAR NOVAMENTE</RetryButtonText>
            </RetryButton>
          </CenteredFrame>
        ) : history.length === 0 ? (
          <CenteredFrame>
            <EmptyText>Nenhum histórico encontrado para este palete.</EmptyText>
          </CenteredFrame>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={contentStyle}>
            {history.map((item, index) => (
              <HistoryItem
                key={item.id}
                isLast={index === history.length - 1}
                item={item}
              />
            ))}
          </ScrollView>
        )}
      </Content>
    </Screen>
  );
}

function HistoryItem({ isLast, item }: { isLast: boolean; item: PalletChangeHistory }) {
  return (
    <TimelineItem>
      <TimelineRail>
        <TimelineDot operation={getOperationVariant(item.typeOperation)} />
        {!isLast ? <TimelineLine /> : null}
      </TimelineRail>
      <HistoryCard>
        <CardHeader>
          <OperationBadge operation={getOperationVariant(item.typeOperation)}>
            <OperationText>{getOperationLabel(item.typeOperation)}</OperationText>
          </OperationBadge>
          <DateText>{formatDateTime(item.createdAt)}</DateText>
        </CardHeader>
        <DescriptionText>{formatDescription(item.description)}</DescriptionText>
        {renderChanges(item)}
        <Footer>
          {renderUser("Usuário", item.user)}
          {item.authorizedBy ? renderUser("Autorizado por", item.authorizedBy) : null}
        </Footer>
      </HistoryCard>
    </TimelineItem>
  );
}

function renderChanges(item: PalletChangeHistory) {
  const fields = (item.fieldsChanged ?? []).filter(field => field !== "updatedAt");
  if (!fields.length) return null;

  return (
    <Changes>
      <ChangesTitle>Alterações</ChangesTitle>
      {fields.map(field => (
        <ChangeRow key={field}>
          <ChangeLabel>{getFieldLabel(field)}</ChangeLabel>
          <ChangeValues>
            <ValueBox>
              <ValueLabel>Antes</ValueLabel>
              <PreviousValue>{formatValue(field, item.previousData?.[field])}</PreviousValue>
            </ValueBox>
            <ArrowText>→</ArrowText>
            <ValueBox>
              <ValueLabel>Depois</ValueLabel>
              <CurrentValue>{formatValue(field, item.currentData?.[field])}</CurrentValue>
            </ValueBox>
          </ChangeValues>
        </ChangeRow>
      ))}
    </Changes>
  );
}

function renderUser(label: string, user?: PalletChangeHistoryUser | null) {
  if (!user) return null;

  const name = [user.name, user.lastName].filter(Boolean).join(" ");

  return (
    <UserBlock key={label}>
      <UserText>{label}: {name || "-"}</UserText>
      {user.email ? <UserText>Email: {user.email}</UserText> : null}
    </UserBlock>
  );
}

function sortHistoryByNewest(current: PalletChangeHistory, next: PalletChangeHistory) {
  return new Date(next.createdAt).getTime() - new Date(current.createdAt).getTime();
}

function getOperationVariant(operation: string) {
  if (operation === "CREATE") return "create";
  if (operation === "DELETE") return "delete";
  return "update";
}

function getOperationLabel(operation: string) {
  if (operation === "CREATE") return "Criação";
  if (operation === "DELETE") return "Exclusão";
  if (operation === "UPDATE") return "Atualização";
  return operation;
}

function getFieldLabel(field: string) {
  return FIELD_LABELS[field] ?? field;
}

function formatDescription(description: string) {
  return Object.entries(FIELD_LABELS).reduce(
    (text, [key, label]) => text.replaceAll(key, label),
    description,
  );
}

function formatValue(field: string, value: unknown) {
  if (value == null || value === "") return "-";
  if (field === "currentStage" && typeof value === "string") return getPalletStageLabel(value);
  if (typeof value === "string" && getPalletStageLabel(value) !== value) return getPalletStageLabel(value);

  if (field.toLowerCase().includes("at") && typeof value === "string") {
    return formatDateTime(value);
  }

  return String(value);
}

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

const contentStyle = {
  paddingBottom: 28,
  paddingTop: 14,
};

const Screen = styled(View, {
  backgroundColor: "$background",
  flex: 1,
});

const Content = styled(View, {
  flex: 1,
  paddingHorizontal: 12,
});

const CenteredFrame = styled(View, {
  alignItems: "center",
  flex: 1,
  gap: 14,
  justifyContent: "center",
});

const TimelineItem = styled(View, {
  flexDirection: "row",
});

const TimelineRail = styled(View, {
  alignItems: "center",
  width: 28,
});

const TimelineDot = styled(View, {
  borderRadius: 999,
  height: 14,
  marginTop: 18,
  width: 14,
  variants: {
    operation: {
      create: { backgroundColor: "$success" },
      delete: { backgroundColor: "$error" },
      update: { backgroundColor: "$warning" },
    },
  } as const,
});

const TimelineLine = styled(View, {
  backgroundColor: "$border",
  flex: 1,
  width: 2,
});

const HistoryCard = styled(View, {
  backgroundColor: "$card",
  borderColor: "$border",
  borderRadius: 16,
  borderWidth: 1,
  flex: 1,
  gap: 10,
  marginBottom: 14,
  padding: 14,
});

const CardHeader = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  gap: 8,
  justifyContent: "space-between",
});

const OperationBadge = styled(View, {
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 5,
  variants: {
    operation: {
      create: { backgroundColor: "$success" },
      delete: { backgroundColor: "$error" },
      update: { backgroundColor: "$warning" },
    },
  } as const,
});

const OperationText = styled(Text, {
  ...typography.label,
  color: "$white",
  fontWeight: "900",
});

const DateText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
  flexShrink: 1,
  textAlign: "right",
});

const DescriptionText = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "700",
});

const Changes = styled(View, {
  borderColor: "$border",
  borderRadius: 12,
  borderWidth: 1,
  gap: 10,
  padding: 10,
});

const ChangesTitle = styled(Text, {
  ...typography.bodySmall,
  color: "$text",
  fontWeight: "900",
});

const ChangeRow = styled(View, {
  gap: 6,
});

const ChangeLabel = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "800",
});

const ChangeValues = styled(View, {
  alignItems: "center",
  flexDirection: "row",
  gap: 8,
});

const ValueBox = styled(View, {
  backgroundColor: "$background",
  borderColor: "$border",
  borderRadius: 10,
  borderWidth: 1,
  flex: 1,
  gap: 3,
  padding: 8,
});

const ValueLabel = styled(Text, {
  ...typography.label,
  color: "$mutedText",
});

const PreviousValue = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
  fontWeight: "800",
});

const CurrentValue = styled(Text, {
  ...typography.bodySmall,
  color: "$success",
  fontWeight: "800",
});

const ArrowText = styled(Text, {
  ...typography.bodyLarge,
  color: "$mutedText",
  fontWeight: "900",
});

const Footer = styled(View, {
  borderTopColor: "$border",
  borderTopWidth: 1,
  gap: 8,
  paddingTop: 10,
});

const UserBlock = styled(View, {
  gap: 2,
});

const UserText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
});

const EmptyText = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
  fontWeight: "700",
  textAlign: "center",
});

const ErrorText = styled(Text, {
  ...typography.bodyMedium,
  color: "$error",
  fontWeight: "700",
  textAlign: "center",
});

const RetryButton = styled(Button, {
  alignItems: "center",
  backgroundColor: "$primary",
  borderRadius: 12,
  justifyContent: "center",
  minHeight: 46,
  paddingHorizontal: 18,
  paddingVertical: 12,
  pressStyle: primaryButtonPressStyle,
});

const RetryButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
});
