import React from "react";
import { StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FileWarning } from "lucide-react-native";
import PdfRendererView from "react-native-pdf-renderer";
import type { RootStackParamList } from "@navigation/navigation.protocol";
import { LottieAnimLoading } from "@shared/components/Feedback";
import {
  CenteredFrame,
  PageLabel,
  RetryButton,
  RetryButtonText,
  Screen,
  StateIconFrame,
  StateText,
  StateTitle,
  ViewerFrame,
  ViewerHeader,
} from "./styled";
import { useManualScreen } from "./useManualScreen";

type Props = NativeStackScreenProps<RootStackParamList, "Manual">;

export function ManualScreen({ navigation }: Props) {
  const {
    currentPage,
    errorMessage,
    handlePageChange,
    handleRendererError,
    isLoading,
    manualUri,
    rendererFailed,
    retryDocument,
    theme,
    totalPages,
  } = useManualScreen(navigation);

  if (isLoading) {
    return (
      <Screen>
        <CenteredFrame>
          <LottieAnimLoading label="Carregando manual" />
        </CenteredFrame>
      </Screen>
    );
  }

  if (errorMessage || rendererFailed || !manualUri) {
    return (
      <Screen>
        <CenteredFrame>
          <StateIconFrame>
            <FileWarning size={34} color={theme.error} />
          </StateIconFrame>
          <StateTitle>Não foi possível abrir o manual</StateTitle>
          <StateText>
            {rendererFailed
              ? "O arquivo local do manual não pôde ser exibido."
              : errorMessage}
          </StateText>
          <RetryButton onPress={retryDocument}>
            <RetryButtonText>TENTAR NOVAMENTE</RetryButtonText>
          </RetryButton>
        </CenteredFrame>
      </Screen>
    );
  }

  return (
    <Screen>
      <ViewerHeader>
        <PageLabel>
          {totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : "Manual em PDF"}
        </PageLabel>
      </ViewerHeader>

      <ViewerFrame>
        <PdfRendererView
          source={manualUri}
          distanceBetweenPages={12}
          maxPageResolution={2048}
          maxZoom={4}
          onError={handleRendererError}
          onPageChange={handlePageChange}
          style={[styles.pdf, { backgroundColor: theme.surface }]}
        />
      </ViewerFrame>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
  },
});
