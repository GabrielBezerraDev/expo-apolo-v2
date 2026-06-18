import { useEffect } from "react";
import { useModal } from "@shared/components/Display/Modal";
import { useSocket } from "@shared/services/socket";
import { RoadmapNotificationModal } from "../components";
import type { RoadmapHistoryChangeSocket } from "../protocol";

const ROADMAP_HISTORY_EVENT = "roadmap-history-change";

export function useRoadmapNotifications() {
  const { openModal } = useModal();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleRoadmapHistoryChange = (notification: RoadmapHistoryChangeSocket) => {
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

    socket.on(ROADMAP_HISTORY_EVENT, handleRoadmapHistoryChange);

    return () => {
      socket.off(ROADMAP_HISTORY_EVENT, handleRoadmapHistoryChange);
    };
  }, [openModal, socket]);
}
