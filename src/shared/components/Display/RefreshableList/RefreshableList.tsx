import React from "react";
import {
  FlatList,
  ListRenderItem,
  StyleProp,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import EmptyIllustration from "@assets/svg/Empty-rafiki.svg";
import ErrorIllustration from "@assets/svg/error-illustration-exact.svg";
import { LottieAnimLoading } from "@shared/components/Feedback";
import { ErrorText, FeedbackRoot, FeedbackText, RetryButton, RetryButtonText } from "./styled";
import { useRefreshableList } from "./useRefreshableList";

type Props<ItemT> = {
  contentContainerStyle?: StyleProp<ViewStyle>;
  data: ItemT[];
  emptyMessage?: string;
  errorMessage?: string;
  isError?: boolean;
  isLoading?: boolean;
  isRefreshing?: boolean;
  isTimeoutError?: boolean;
  keyExtractor: (item: ItemT, index: number) => string;
  loadingLabel?: string;
  onRefresh?: () => void;
  renderItem: ListRenderItem<ItemT>;
  showsVerticalScrollIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
};

const defaultContentContainerStyle: ViewStyle = {
  gap: 14,
  paddingBottom: 80
};

export function RefreshableList<ItemT>({
  contentContainerStyle,
  data,
  emptyMessage,
  errorMessage,
  isError,
  isLoading,
  isRefreshing,
  isTimeoutError,
  keyExtractor,
  loadingLabel,
  onRefresh,
  renderItem,
  showsVerticalScrollIndicator = false,
  style,
}: Props<ItemT>) {
  const { width, height } = useWindowDimensions();
  const illustrationSize = getFeedbackIllustrationSize(width, height);
  const {
    emptyMessage: resolvedEmptyMessage,
    errorMessage: resolvedErrorMessage,
    loadingLabel: resolvedLoadingLabel,
    refreshControl,
    showEmpty,
    showError,
    showLoading,
  } = useRefreshableList({
    dataLength: data.length,
    emptyMessage,
    errorMessage,
    isError,
    isLoading,
    isRefreshing,
    loadingLabel,
    onRefresh,
  });

  if (showLoading) {
    return (
      <FeedbackRoot>
        <LottieAnimLoading label={resolvedLoadingLabel} />
      </FeedbackRoot>
    );
  }

  return (
    <FlatList
      data={showError ? [] : data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      refreshControl={refreshControl}
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[
        defaultContentContainerStyle,
        (showEmpty || showError) ? { flexGrow: 1 } : null,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      ListEmptyComponent={isTimeoutError && showError ? renderTimeoutError : showError ? renderError : renderEmpty}
    />
  );

  function renderEmpty() {
    return (
      <FeedbackRoot>
        <EmptyIllustration width={illustrationSize.width} height={illustrationSize.height} />
        <FeedbackText>{resolvedEmptyMessage}</FeedbackText>
      </FeedbackRoot>
    );
  }

  function renderTimeoutError() {
    return (
      <FeedbackRoot>
        <ErrorIllustration width={illustrationSize.width} height={illustrationSize.height} />
        <ErrorText>{resolvedErrorMessage}</ErrorText>
        {onRefresh ? (
          <RetryButton onPress={onRefresh}>
            <RetryButtonText>TENTAR NOVAMENTE</RetryButtonText>
          </RetryButton>
        ) : null}
      </FeedbackRoot>
    );
  }

  function renderError() {
    return (
      <FeedbackRoot>
        <ErrorText>{resolvedErrorMessage}</ErrorText>
      </FeedbackRoot>
    );
  }
}

function getFeedbackIllustrationSize(width: number, height: number) {
  const shortestSide = Math.min(width, height);
  const illustrationWidth = Math.min(Math.max(shortestSide * 0.56, 180), 320);

  return {
    height: illustrationWidth * 0.82,
    width: illustrationWidth,
  };
}
