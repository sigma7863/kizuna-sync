export const FAMILY_REALTIME_TRANSPORTS: ("websocket" | "polling")[] = ["websocket", "polling"];

export const FAMILY_REALTIME_SOCKET_OPTIONS = {
  transports: FAMILY_REALTIME_TRANSPORTS,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 500,
  timeout: 8_000,
} as const;

export function isFamilyScopedEvent(eventFamilyGroupId: number, familyGroupId: number) {
  return Number.isInteger(familyGroupId) && familyGroupId > 0 && eventFamilyGroupId === familyGroupId;
}

export function isUserNotification(
  notificationUserId: number,
  notificationFamilyGroupId: number,
  userId: number,
  familyGroupId: number,
) {
  return notificationUserId === userId && isFamilyScopedEvent(notificationFamilyGroupId, familyGroupId);
}

export function canMarkFamilyNotificationRead(familyGroupId: number, notificationId: number) {
  return Number.isInteger(familyGroupId) && familyGroupId > 0 && Number.isInteger(notificationId) && notificationId > 0;
}
