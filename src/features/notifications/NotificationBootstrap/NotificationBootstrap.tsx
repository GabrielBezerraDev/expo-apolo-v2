import { useRoadmapNotifications } from "./useRoadmapNotifications";
import { usePushNotifications } from "./usePushNotifications";

export function NotificationBootstrap() {
  usePushNotifications();
  useRoadmapNotifications();
  return null;
}
