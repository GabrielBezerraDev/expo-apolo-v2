import React from "react";
import {
  FlatList,
  ListRenderItem,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LottieAnimLoading } from "@shared/components/Feedback";
import { ErrorText, FeedbackRoot, FeedbackText } from "./styled";
import { useRefreshableList } from "./useRefreshableList";

type Props<ItemT> = {
  contentContainerStyle?: StyleProp<ViewStyle>;
  data: ItemT[];
  emptyMessage?: string;
  errorMessage?: string;
  isError?: boolean;
  isLoading?: boolean;
  isRefreshing?: boolean;
  keyExtractor: (item: ItemT, index: number) => string;
  loadingLabel?: string;
  onRefresh?: () => void;
  renderItem: ListRenderItem<ItemT>;
  showsVerticalScrollIndicator?: boolean;
  style?: StyleProp<ViewStyle>;
};

const defaultContentContainerStyle: ViewStyle = {
  gap: 14,
  paddingVertical: 20,
};

export function RefreshableList<ItemT>({
  contentContainerStyle,
  data,
  emptyMessage,
  errorMessage,
  isError,
  isLoading,
  isRefreshing,
  keyExtractor,
  loadingLabel,
  onRefresh,
  renderItem,
  showsVerticalScrollIndicator = false,
  style,
}: Props<ItemT>) {
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
      ListEmptyComponent={showError ? renderError : renderEmpty}
    />
  );

  function renderEmpty() {
    return (
      <FeedbackRoot>
        <FeedbackText>{resolvedEmptyMessage}</FeedbackText>
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
