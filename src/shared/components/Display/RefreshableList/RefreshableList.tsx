import React, { useEffect, useRef } from "react";
import {
  FlatList,
  ListRenderItem,
  StyleProp,
  useWindowDimensions,
  ViewStyle,
} from "react-native";
import EmptyIllustration from "@assets/svg/Empty-rafiki.svg";
import ErrorIllustration from "@assets/svg/error-illustration-exact.svg";
import WithoutInternetIllustration from "@assets/svg/Without_internet.svg";
import { LottieAnimLoading } from "@shared/components/Feedback";
import { useModal } from "@shared/components/Display/Modal";
import { ErrorText, FeedbackRoot, FeedbackText, OfflineNoticeText, RetryButton, RetryButtonText } from "./styled";
import { useRefreshableList } from "./useRefreshableList";

type Props<ItemT> = {
  contentContainerStyle?: StyleProp<ViewStyle>;
  data: ItemT[];
  emptyMessage?: string;
  errorMessage?: string;
  isError?: boolean;
  isLoading?: boolean;
  isOfflineState?: boolean;
  isRefreshing?: boolean;
  isTimeoutError?: boolean;
  keyExtractor: (item: ItemT, index: number) => string;
  loadingLabel?: string;
  offlineMessage?: string;
  offlineNoticeMessage?: string;
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
  isOfflineState,
  isRefreshing,
  isTimeoutError,
  keyExtractor,
  loadingLabel,
  offlineMessage = "Sem conexão com a internet.",
  offlineNoticeMessage = "Sem conexão com a internet. Exibindo dados salvos recentemente.",
  onRefresh,
  renderItem,
  showsVerticalScrollIndicator = false,
  style,
}: Props<ItemT>) {
  const { openModal } = useModal();
  const lastOfflineNoticeStateRef = useRef(false);
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
    showOffline,
  } = useRefreshableList({
    dataLength: data.length,
    emptyMessage,
    errorMessage,
    isError,
    isLoading,
    isOfflineState,
    isRefreshing,
    loadingLabel,
    onRefresh,
  });

  useEffect(() => {
    const shouldShowOfflineNotice = Boolean(isOfflineState && data.length > 0);

    if (shouldShowOfflineNotice && !lastOfflineNoticeStateRef.current) {
      openModal(<OfflineNotice message={offlineNoticeMessage} />, {
        animationType: "slide",
        bodyStyle: { padding: 12 },
        closeOnBackdrop: false,
        maxHeightPercent: 22,
        minHeight: 0,
        placement: "notification",
        showCloseButton: false,
        showHeader: false,
        timeModal: 4200,
        widthPercent: 92,
      });
    }

    lastOfflineNoticeStateRef.current = shouldShowOfflineNotice;
  }, [data.length, isOfflineState, offlineNoticeMessage, openModal]);

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
        (showEmpty || showError || showOffline) ? { flexGrow: 1 } : null,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      ListEmptyComponent={showOffline ? renderOffline : isTimeoutError && showError ? renderTimeoutError : showError ? renderError : renderEmpty}
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

  function renderOffline() {
    return (
      <FeedbackRoot>
        <WithoutInternetIllustration width={illustrationSize.width} height={illustrationSize.height} />
        <FeedbackText>{offlineMessage}</FeedbackText>
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

function OfflineNotice({ message }: { message: string }) {
  return <OfflineNoticeText>{message}</OfflineNoticeText>;
}

function getFeedbackIllustrationSize(width: number, height: number) {
  const shortestSide = Math.min(width, height);
  const illustrationWidth = Math.min(Math.max(shortestSide * 0.56, 180), 320);

  return {
    height: illustrationWidth * 0.82,
    width: illustrationWidth,
  };
}
