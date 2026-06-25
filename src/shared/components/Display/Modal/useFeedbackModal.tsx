import React, { ReactNode, useCallback } from "react";
import { styled, Text, View } from "tamagui";
import { AppButton } from "@shared/components/Forms/AppButton";
import { typography } from "@shared/typography";
import { ModalOptions } from "./modal.type";
import { useModal } from "./ModalProvider";

type AppButtonVariant = React.ComponentProps<typeof AppButton>["variant"];

type FeedbackModalParams = {
  actionLabel?: string;
  message: ReactNode;
  modalOptions?: ModalOptions;
  onClose?: () => void;
  title: string;
};

type ConfirmModalParams = {
  cancelLabel?: string;
  confirmLabel: string;
  confirmVariant?: AppButtonVariant;
  message: ReactNode;
  modalOptions?: ModalOptions;
  onCancel?: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
};

const baseModalOptions: ModalOptions = {
  animationType: "slide",
  closeOnBackdrop: false,
  maxHeightPercent: 54,
  minHeight: 0,
  preventClose: true,
  showCloseButton: false,
  widthPercent: 88,
};

export function useFeedbackModal() {
  const { closeModal, openModal } = useModal();

  const showFeedback = useCallback(({ actionLabel = "ENTENDI", message, modalOptions, onClose, title }: FeedbackModalParams) => {
    let modalId = "";

    modalId = openModal(
      <FeedbackModalContent
        message={message}
        primaryLabel={actionLabel}
        onPrimaryPress={() => {
          closeModal(modalId);
          onClose?.();
        }}
      />,
      {
        ...baseModalOptions,
        ...modalOptions,
        title,
      },
    );

    return modalId;
  }, [closeModal, openModal]);

  const showConfirm = useCallback(({
    cancelLabel = "Cancelar",
    confirmLabel,
    confirmVariant = "danger",
    message,
    modalOptions,
    onCancel,
    onConfirm,
    title,
  }: ConfirmModalParams) => {
    let modalId = "";

    modalId = openModal(
      <FeedbackModalContent
        cancelLabel={cancelLabel}
        confirmVariant={confirmVariant}
        message={message}
        primaryLabel={confirmLabel}
        onCancelPress={() => {
          closeModal(modalId);
          onCancel?.();
        }}
        onPrimaryPress={() => {
          closeModal(modalId);
          void onConfirm();
        }}
      />,
      {
        ...baseModalOptions,
        ...modalOptions,
        title,
      },
    );

    return modalId;
  }, [closeModal, openModal]);

  return {
    showConfirm,
    showFeedback,
  };
}

function FeedbackModalContent({
  cancelLabel,
  confirmVariant = "primary",
  message,
  onCancelPress,
  onPrimaryPress,
  primaryLabel,
}: {
  cancelLabel?: string;
  confirmVariant?: AppButtonVariant;
  message: ReactNode;
  onCancelPress?: () => void;
  onPrimaryPress: () => void;
  primaryLabel: string;
}) {
  return (
    <FeedbackRoot>
      <FeedbackMessage>{message}</FeedbackMessage>
      <FeedbackActions>
        {onCancelPress ? <AppButton title={cancelLabel ?? "Cancelar"} variant="outline" onPress={onCancelPress} /> : null}
        <AppButton title={primaryLabel} variant={confirmVariant} onPress={onPrimaryPress} />
      </FeedbackActions>
    </FeedbackRoot>
  );
}

const FeedbackRoot = styled(View, {
  gap: 18,
  justifyContent: "center",
});

const FeedbackMessage = styled(Text, {
  ...typography.bodyMedium,
  color: "$text",
  fontWeight: "700",
  textAlign: "center",
});

const FeedbackActions = styled(View, {
  gap: 10,
});
