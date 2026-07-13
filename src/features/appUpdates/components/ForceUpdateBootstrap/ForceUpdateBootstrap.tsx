import React, { useEffect, useRef } from "react";
import { useModal } from "@shared/components/Display/Modal";
import { useAppUpdateChecker } from "../../hooks/useAppUpdateChecker";
import { ForceUpdateModal } from "../ForceUpdateModal";

export function ForceUpdateBootstrap() {
  const { openModal } = useModal();
  const { hasUpdate, update } = useAppUpdateChecker();
  const didOpenRef = useRef(false);

  useEffect(() => {
    if (didOpenRef.current || !hasUpdate || !update) return;

    didOpenRef.current = true;
    openModal(
      <ForceUpdateModal
        currentVersion={update.currentVersion}
        downloadUrl={update.downloadUrl}
        latestVersion={update.latestVersion}
      />,
      {
        animationType: "fade",
        closeOnBackdrop: false,
        maxWidth: 460,
        minHeight: 0,
        preventClose: true,
        showCloseButton: false,
        showHeader: false,
        widthPercent: 90,
      },
    );
  }, [hasUpdate, openModal, update]);

  return null;
}
