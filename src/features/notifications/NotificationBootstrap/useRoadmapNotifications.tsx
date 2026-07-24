import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@shared/components/Display/Modal";
import { useSocket } from "@shared/services/socket";
import {
  PalletIncidentNotificationModal,
  PalletNotificationModal,
  RoadmapNotificationModal,
} from "../components";
import type {
  PalletHistoryChangeSocket,
  PalletIncidentCreatedSocket,
  RoadmapHistoryChangeSocket,
} from "../protocol";

const PALLET_INCIDENT_CREATED_EVENT = "pallet-incident-created";
const PALLET_HISTORY_EVENT = "pallet-history-change";
const ROADMAP_HISTORY_EVENT = "roadmap-history-change";

export function useRoadmapNotifications() {
  const queryClient = useQueryClient();
  const { openModal } = useModal();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleRoadmapHistoryChange = (notification: RoadmapHistoryChangeSocket) => {
      void queryClient.invalidateQueries({ queryKey: ["roadmap"] });
      void queryClient.invalidateQueries({ queryKey: ["quality-report"] });

      openModal(
        <RoadmapNotificationModal notification={notification} />,
        {
          animationType: "slide",
          maxHeightPercent: 40,
          maxWidth: 560,
          minHeight: 0,
          placement: "notification",
          showCloseButton: true,
          title: `Atualização no roteiro ${notification.roadmapCode}`,
          widthPercent: 92,
        },
      );
    };

    const handlePalletHistoryChange = (notification: PalletHistoryChangeSocket) => {
      if (notification.source === "pallet_incident") return;

      void queryClient.invalidateQueries({ queryKey: ["quality-report"] });
      void queryClient.invalidateQueries({ queryKey: ["roadmap"] });

      openModal(
        <PalletNotificationModal notification={notification} />,
        {
          animationType: "slide",
          maxHeightPercent: 40,
          maxWidth: 560,
          minHeight: 0,
          placement: "notification",
          showCloseButton: true,
          title: `Atualização no palete ${notification.batch ?? ""}`.trim(),
          widthPercent: 92,
        },
      );
    };

    const handlePalletIncidentCreated = (notification: PalletIncidentCreatedSocket) => {
      void queryClient.invalidateQueries({ queryKey: ["quality-report"] });
      void queryClient.invalidateQueries({ queryKey: ["roadmap"] });
      void queryClient.invalidateQueries({
        queryKey: ["pallet-history", notification.palletId],
      });

      openModal(
        <PalletIncidentNotificationModal notification={notification} />,
        {
          animationType: "slide",
          maxHeightPercent: 50,
          maxWidth: 560,
          minHeight: 0,
          placement: "notification",
          priority: 10,
          showCloseButton: true,
          timeModal: 8000,
          title: `Incidente no palete ${notification.palletBatch}`,
          widthPercent: 92,
        },
      );
    };

    socket.on(ROADMAP_HISTORY_EVENT, handleRoadmapHistoryChange);
    socket.on(PALLET_HISTORY_EVENT, handlePalletHistoryChange);
    socket.on(PALLET_INCIDENT_CREATED_EVENT, handlePalletIncidentCreated);

    return () => {
      socket.off(ROADMAP_HISTORY_EVENT, handleRoadmapHistoryChange);
      socket.off(PALLET_HISTORY_EVENT, handlePalletHistoryChange);
      socket.off(PALLET_INCIDENT_CREATED_EVENT, handlePalletIncidentCreated);
    };
  }, [openModal, queryClient, socket]);
}
