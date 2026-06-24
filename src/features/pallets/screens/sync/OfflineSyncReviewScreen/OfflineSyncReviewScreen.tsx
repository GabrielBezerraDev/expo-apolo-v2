import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, styled, Text, View } from "tamagui";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { RefreshableList } from "@shared/components/Display";
import { AppHeader } from "@shared/components/Navigation/AppHeader";
import { typography } from "@shared/typography";
import type { OfflinePalletOperation, OfflinePalletOperationStep } from "../../../protocol";
import { listValidationFailedPalletOperations, useOfflinePalletOperation } from "../../../services/offlinePalletOperations";

type Props = NativeStackScreenProps<RootStackParamList, "OfflineSyncReview">;

export function OfflineSyncReviewScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [operations, setOperations] = useState<OfflinePalletOperation[]>([]);
  const { hydrateOperationById } = useOfflinePalletOperation();

  const loadOperations = useCallback(async () => {
    setIsLoading(true);
    try {
      setOperations(await listValidationFailedPalletOperations());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadOperations();
    }, [loadOperations]),
  );

  const reviewOperation = useCallback(async (operation: OfflinePalletOperation) => {
    await hydrateOperationById(operation.id);
    const route = getRouteByStep(operation.validationIssues?.[0]?.stage ?? operation.currentStep);

    if (route) {
      navigation.navigate(route);
      return;
    }

    navigation.navigate("PalletOperationSummary", { operationId: operation.id });
  }, [hydrateOperationById, navigation]);

  return (
    <Screen>
      <AppHeader
        title="Revisar sincronização"
        subtitle="Operações que falharam na validação"
        onBack={() => navigation.goBack()}
      />
      <Content>
        <RefreshableList
          data={operations}
          emptyMessage="Nenhuma operação para revisão"
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          loadingLabel="Carregando revisões"
          onRefresh={loadOperations}
          renderItem={({ item }) => (
            <ReviewCard item={item} onReview={() => { void reviewOperation(item); }} />
          )}
        />
      </Content>
    </Screen>
  );
}

function ReviewCard({ item, onReview }: { item: OfflinePalletOperation; onReview: () => void }) {
  const issue = item.validationIssues?.[0];

  return (
    <Card>
      <CardTitle>{item.operationType === "entry" ? "Entrada" : "Saída"}: {item.roadmap ?? "Sem roteiro"}</CardTitle>
      <CardText>Etapa: {getStepLabel(issue?.stage ?? item.currentStep)}</CardText>
      <IssueText>{issue?.message ?? item.lastError ?? "Operação precisa ser revisada."}</IssueText>
      {item.validationIssues && item.validationIssues.length > 1 ? (
        <CardText>{item.validationIssues.length} pendências encontradas.</CardText>
      ) : null}
      <ReviewButton onPress={onReview}>
        <ReviewButtonText>REVISAR ETAPA</ReviewButtonText>
      </ReviewButton>
    </Card>
  );
}

function getRouteByStep(step: OfflinePalletOperationStep) {
  const routeByStep = {
    completed: undefined,
    exit_extra_evidence: "ExitExtraEvidence",
    form: "FormScreenPallet",
    pallets_evidence: "PalletsEvidence",
    ship_goods: "ExitExtraEvidence",
  } as const;

  return routeByStep[step];
}

function getStepLabel(step: string) {
  const labels: Record<string, string> = {
    completed: "Completo",
    exit_extra_evidence: "Evidências finais da saída",
    form: "Dados iniciais",
    pallets_evidence: "Evidências dos paletes",
    ship_goods: "Evidências finais da saída",
  };

  return labels[step] ?? step;
}

const Screen = styled(View, {
  backgroundColor: "$background",
  flex: 1,
});

const Content = styled(View, {
  flex: 1,
  paddingHorizontal: 12,
  paddingTop: 14,
});

const Card = styled(View, {
  backgroundColor: "$card",
  borderColor: "$warning",
  borderRadius: 16,
  borderWidth: 1.5,
  gap: 8,
  padding: 14,
});

const CardTitle = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "900",
});

const CardText = styled(Text, {
  ...typography.bodySmall,
  color: "$mutedText",
  fontWeight: "700",
});

const IssueText = styled(Text, {
  ...typography.bodyMedium,
  color: "$error",
  fontWeight: "800",
});

const ReviewButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "$primary",
  borderRadius: 12,
  justifyContent: "center",
  marginTop: 8,
  minHeight: 46,
  paddingHorizontal: 18,
  paddingVertical: 12,
});

const ReviewButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
});
