import React, { useEffect, useRef } from "react";
import { useModal } from "@shared/components/Display/Modal";
import { useAuthSession } from "@shared/services/authSession";
import { ChangePasswordModal } from "../ChangePasswordModal";

export function PasswordChangeBootstrap() {
  const { closeModal, openModal } = useModal();
  const { status } = useAuthSession();
  const didOpenRef = useRef(false);
  const modalIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "passwordChangeRequired" || didOpenRef.current) return;

    didOpenRef.current = true;
    const closePasswordModal = () => {
      if (modalIdRef.current) closeModal(modalIdRef.current);
    };

    modalIdRef.current = openModal(
      <ChangePasswordModal onSuccess={closePasswordModal} />,
      {
        animationType: "fade",
        closeOnBackdrop: false,
        maxHeightPercent: 92,
        maxWidth: 480,
        minHeight: 0,
        preventClose: true,
        priority: 50,
        showCloseButton: false,
        showHeader: false,
        widthPercent: 94,
      },
    );
  }, [closeModal, openModal, status]);

  return null;
}
