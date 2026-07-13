import React, { useCallback, useState } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, styled, Text, useWindowDimensions, View } from "tamagui";
import NoDataIllustration from "@assets/svg/No data-bro.svg";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { buttonPressStyle, primaryButtonPressStyle } from "@shared/styles/pressFeedback";
import { typography } from "@shared/typography";
import type { OfflinePalletOperation, OfflinePalletOperationStep } from "../../../protocol";
import { getOfflinePalletOperation, useOfflinePalletOperation } from "../../../services/offlinePalletOperations";
import { usePallet } from "../../../providers/PalletProvider";
import { useAppHeaderConfig } from "@shared/components/Navigation";
import { useAuthSession } from "@shared/services/authSession";

type Props = NativeStackScreenProps<RootStackParamList, "OperationSyncError">;

export function OperationSyncError({ navigation, route }: Props) {
  const [operation, setOperation] = useState<OfflinePalletOperation | null>(null);
  const { userId } = useAuthSession();
  const { hydrateOperationById } = useOfflinePalletOperation();
  const { resetEntry } = usePallet();
  const { width, height } = useWindowDimensions();
  const illustrationSize = Math.min(Math.min(width, height) * 0.72, 310);
  const contentWidth = Math.min(width * 0.86, 430);
  const failedStage = getFailedStage(operation);
  const messages = getErrorMessages(operation, failedStage);
  
  useAppHeaderConfig({visible:false});
  
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const operationPromise = userId
        ? getOfflinePalletOperation(route.params.operationId, userId)
        : Promise.resolve(null);

      operationPromise.then(nextOperation => {
        if (active) setOperation(nextOperation);
      });

      return () => {
        active = false;
      };
    }, [route.params.operationId, userId]),
  );

  const goHome = useCallback(() => {
    resetEntry();
    navigation.reset({
      index: 0,
      routes: [{ name: "Main" }],
    });
  }, [navigation, resetEntry]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        goHome();
        return true;
      });

      return () => subscription.remove();
    }, [goHome]),
  );

  const reviewStage = useCallback(async () => {
    const hydratedOperation = await hydrateOperationById(route.params.operationId, {
      clearInvalidFields: true,
      reviewStage: failedStage,
    });
    const routeName = getRouteByStage(failedStage);

    if (!hydratedOperation || !routeName) {
      navigation.navigate("PalletOperationSummary", { operationId: route.params.operationId });
      return;
    }

    navigation.navigate(routeName);
  }, [failedStage, hydrateOperationById, navigation, route.params.operationId]);

  return (
    <Screen>
      <Content width={contentWidth}>
        <NoDataIllustration width={illustrationSize} height={illustrationSize} />
        <Title>Não foi possível sincronizar</Title>
        <Description>
          {getOperationLabel(operation)} ficou salva como rascunho. Revise a etapa abaixo antes de tentar enviar novamente.
        </Description>

        <ErrorBox>
          <StageLabel>Etapa com falha</StageLabel>
          <StageTitle>{getStageLabel(failedStage)}</StageTitle>
          {messages.map((message, index) => (
            <ErrorMessage key={`${failedStage}-${index}`}>{message}</ErrorMessage>
          ))}
        </ErrorBox>

        <ReviewButton onPress={reviewStage}>
          <ReviewButtonText>{getReviewButtonLabel(failedStage)}</ReviewButtonText>
        </ReviewButton>
        <HomeButton onPress={goHome}>
          <HomeButtonText>TELA INICIAL</HomeButtonText>
        </HomeButton>
      </Content>
    </Screen>
  );
}

function getFailedStage(operation: OfflinePalletOperation | null): OfflinePalletOperationStep {
  const issueStage = operation?.validationIssues?.[0]?.stage;
  if (issueStage) return issueStage;
  if (operation?.currentStep && operation.currentStep !== "completed") return operation.currentStep;

  return "completed";
}

function getErrorMessages(operation: OfflinePalletOperation | null, stage: OfflinePalletOperationStep) {
  const stageIssues = operation?.validationIssues?.filter(issue => issue.stage === stage) ?? [];
  if (stageIssues.length > 0) {
    return stageIssues.map(issue => {
      if (issue.batch) return `${issue.batch}: ${issue.message}`;
      if (issue.palletIndex != null) return `Palete ${issue.palletIndex + 1}: ${issue.message}`;

      return issue.message;
    });
  }

  return [operation?.lastError ?? "A operação não foi aceita pela API."];
}

function getOperationLabel(operation: OfflinePalletOperation | null) {
  if (!operation) return "A movimentação";

  return operation.operationType === "entry" ? "A entrada" : "A saída";
}

function getRouteByStage(stage: OfflinePalletOperationStep) {
  const routeByStage = {
    completed: undefined,
    exit_extra_evidence: "ExitExtraEvidence",
    form: "FormScreenRoadmap",
    pallets_evidence: "PalletsEvidence",
    ship_goods: "ExitExtraEvidence",
  } as const;

  return routeByStage[stage];
}

function getStageLabel(stage: OfflinePalletOperationStep) {
  const labels: Record<OfflinePalletOperationStep, string> = {
    completed: "Sincronização",
    exit_extra_evidence: "Evidências finais da saída",
    form: "Dados iniciais",
    pallets_evidence: "Evidências dos paletes",
    ship_goods: "Evidências finais da saída",
  };

  return labels[stage];
}

function getReviewButtonLabel(stage: OfflinePalletOperationStep) {
  if (stage === "completed") return "VER RASCUNHO";
  if (stage === "form") return "REVISAR DADOS INICIAIS";
  if (stage === "pallets_evidence") return "REVISAR EVIDÊNCIAS DOS PALETES";

  return "REVISAR EVIDÊNCIAS FINAIS";
}

const Screen = styled(View, {
  alignItems: "center",
  backgroundColor: "$background",
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 24,
  paddingVertical: 28,
});

const Content = styled(View, {
  alignItems: "center",
  gap: 16,
  justifyContent: "center",
});

const Title = styled(Text, {
  ...typography.headingSmall,
  color: "$text",
  fontWeight: "900",
  textAlign: "center",
});

const Description = styled(Text, {
  ...typography.bodyMedium,
  color: "$mutedText",
  fontWeight: "700",
  textAlign: "center",
});

const ErrorBox = styled(View, {
  backgroundColor: "$card",
  borderColor: "$error",
  borderRadius: 14,
  borderWidth: 1.4,
  gap: 6,
  marginTop: 8,
  padding: 14,
  width: "100%",
});

const StageLabel = styled(Text, {
  ...typography.label,
  color: "$mutedText",
  fontWeight: "800",
  textTransform: "uppercase",
});

const StageTitle = styled(Text, {
  ...typography.bodyLarge,
  color: "$text",
  fontWeight: "900",
});

const ErrorMessage = styled(Text, {
  ...typography.bodySmall,
  color: "$error",
  fontWeight: "800",
});

const ReviewButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  backgroundColor: "$primary",
  borderColor: "$black",
  borderRadius: 10,
  borderWidth: 1.5,
  justifyContent: "center",
  marginTop: 8,
  minHeight: 46,
  paddingHorizontal: 18,
  paddingVertical: 10,
  pressStyle: primaryButtonPressStyle,
  width: "100%",
});

const ReviewButtonText = styled(Text, {
  ...typography.button,
  color: "$white",
  fontWeight: "900",
  textAlign: "center",
});

const HomeButton = styled(Button, {
  unstyled: true,
  alignItems: "center",
  borderColor: "$primary",
  borderRadius: 10,
  borderWidth: 1.5,
  justifyContent: "center",
  minHeight: 44,
  paddingHorizontal: 18,
  paddingVertical: 9,
  pressStyle: buttonPressStyle,
  width: "100%",
});

const HomeButtonText = styled(Text, {
  ...typography.button,
  color: "$primary",
  fontWeight: "900",
  textAlign: "center",
});
