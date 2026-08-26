import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  canMarkFamilyNotificationRead,
  FAMILY_REALTIME_SOCKET_OPTIONS,
  isFamilyScopedEvent,
  isUserNotification,
} from "@shared/familyRealtime";

export interface RealtimeRippleUpdate {
  userId: number;
  familyGroupId: number;
  activityType: "walking" | "photo" | "music" | "location" | "mood" | "message";
  userName: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface RealtimeLocationUpdate {
  userId: number;
  userName: string;
  familyGroupId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  locationName?: string;
  timestamp: number;
}

export interface RealtimeNotification {
  id: number;
  userId: number;
  familyGroupId: number;
  type: string;
  title: string;
  message: string;
  payload: Record<string, unknown>;
  quiet: boolean;
  createdAt: string | Date;
}

export function useFamilyRealtime(
  familyGroupId: number,
  onNotification?: (notification: RealtimeNotification) => void,
  onLocationUpdate?: (update: RealtimeLocationUpdate) => void,
  onRippleUpdate?: (update: RealtimeRippleUpdate) => void,
) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;
  const locationCallbackRef = useRef(onLocationUpdate);
  locationCallbackRef.current = onLocationUpdate;
  const rippleCallbackRef = useRef(onRippleUpdate);
  rippleCallbackRef.current = onRippleUpdate;

  useEffect(() => {
    if (!user?.id || !familyGroupId) return;

    const activeUserId = user.id;
    const activeFamilyGroupId = familyGroupId;
    const socket = io(window.location.origin, FAMILY_REALTIME_SOCKET_OPTIONS);
    socketRef.current = socket;

    const handleConnect = () => {
      socket.emit("user:join", { userId: activeUserId, familyGroupIds: [activeFamilyGroupId] });
    };
    const handleRipple = (update: RealtimeRippleUpdate) => {
      if (isFamilyScopedEvent(update.familyGroupId, activeFamilyGroupId)) {
        rippleCallbackRef.current?.(update);
      }
    };
    const handleLocation = (update: RealtimeLocationUpdate) => {
      if (isFamilyScopedEvent(update.familyGroupId, activeFamilyGroupId)) {
        locationCallbackRef.current?.(update);
      }
    };
    const handleNotification = (notification: RealtimeNotification) => {
      if (isUserNotification(notification.userId, notification.familyGroupId, activeUserId, activeFamilyGroupId)) {
        callbackRef.current?.(notification);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("ripple:receive", handleRipple);
    socket.on("location:updated", handleLocation);
    socket.on("notification:receive", handleNotification);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("ripple:receive", handleRipple);
      socket.off("location:updated", handleLocation);
      socket.off("notification:receive", handleNotification);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [familyGroupId, user?.id]);

  return {
    markRead: (notificationId: number) => {
      if (!socketRef.current?.connected || !canMarkFamilyNotificationRead(familyGroupId, notificationId)) return;
      socketRef.current.emit("notification:read", { familyGroupId, notificationId });
    },
  };
}
