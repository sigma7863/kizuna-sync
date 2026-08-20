import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/_core/hooks/useAuth";

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
  onNotification?: (notification: RealtimeNotification) => void
) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    if (!user?.id || !familyGroupId) return;
    const socket = io(window.location.origin, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("user:join", { userId: user.id, familyGroupIds: [familyGroupId] });
    });
    socket.on("notification:receive", (notification: RealtimeNotification) => {
      if (notification.userId === user.id && notification.familyGroupId === familyGroupId) {
        callbackRef.current?.(notification);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [familyGroupId, user?.id]);

  return {
    markRead: (notificationId: number) => {
      socketRef.current?.emit("notification:read", { familyGroupId, notificationId });
    },
  };
}
