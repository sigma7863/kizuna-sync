import { useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";

type ActivityType = "walking" | "photo" | "music" | "location" | "mood" | "message";

interface RealtimeActivity {
  userId: number;
  userName: string;
  activityType: ActivityType;
  timestamp: number;
  data?: Record<string, unknown>;
}

interface UseRealtimeSyncProps {
  familyGroupId: number;
  onActivityReceived?: (activity: RealtimeActivity) => void;
  onError?: (error: Error) => void;
}

/**
 * リアルタイム同期フック
 * WebSocket/SSEを使用して家族のアクティビティをリアルタイムで受信
 */
export function useRealtimeSync({
  familyGroupId,
  onActivityReceived,
  onError,
}: UseRealtimeSyncProps) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (isConnectedRef.current) return;

    try {
      // SSEエンドポイントに接続
      // 本番環境ではWebSocketの使用も検討
      const eventSource = new EventSource(
        `/api/realtime/activities?familyGroupId=${familyGroupId}`
      );

      eventSource.addEventListener("activity", (event) => {
        try {
          const activity = JSON.parse(event.data) as RealtimeActivity;
          onActivityReceived?.(activity);
        } catch (error) {
          console.error("Failed to parse activity:", error);
        }
      });

      eventSource.addEventListener("error", (event) => {
        console.error("EventSource error:", event);
        eventSource.close();
        isConnectedRef.current = false;

        // 5秒後に再接続を試みる
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      });

      eventSource.addEventListener("open", () => {
        isConnectedRef.current = true;
        console.log("Realtime sync connected");
      });

      eventSourceRef.current = eventSource;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      console.error("Failed to connect to realtime sync:", err);

      // 5秒後に再接続を試みる
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, [familyGroupId, onActivityReceived, onError]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    isConnectedRef.current = false;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    reconnect: connect,
    disconnect,
  };
}

/**
 * ポーリングベースのリアルタイム同期フック
 * SSEが利用できない環境用のフォールバック
 */
export function useRealtimeSyncPolling({
  familyGroupId,
  onActivityReceived,
  onError,
  pollInterval = 3000,
}: UseRealtimeSyncProps & { pollInterval?: number }) {
  const lastTimestampRef = useRef<number>(Date.now());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(() => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        // ポーリングでアクティビティを取得
        // TODO: tRPCで最新のアクティビティを取得
        const response = await fetch(
          `/api/activities?familyGroupId=${familyGroupId}&since=${lastTimestampRef.current}`
        );

        if (!response.ok) throw new Error("Failed to fetch activities");

        const activities = (await response.json()) as RealtimeActivity[];

        activities.forEach((activity) => {
          onActivityReceived?.(activity);
          lastTimestampRef.current = Math.max(
            lastTimestampRef.current,
            activity.timestamp
          );
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      }
    }, pollInterval);
  }, [familyGroupId, onActivityReceived, onError, pollInterval]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return {
    isPolling: pollingIntervalRef.current !== null,
    stopPolling,
    startPolling,
  };
}
