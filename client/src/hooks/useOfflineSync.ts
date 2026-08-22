import { useEffect, useState, useCallback, useRef } from "react";

export interface PendingActivity {
  id: string;
  type: "activity" | "timeline" | "location";
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

/**
 * オフライン同期フック
 * Service Workerとの連携でオフライン中のデータをキューイングし、
 * オンライン復帰時に自動同期
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingActivities, setPendingActivities] = useState<PendingActivity[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [conflictActivityIds, setConflictActivityIds] = useState<string[]>([]);
  const syncingRef = useRef(false);

  // Service Worker の登録
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("[ServiceWorker] Registered:", registration);
      })
      .catch((error) => {
        console.error("[ServiceWorker] Registration failed:", error);
      });
  }, []);

  // オンライン/オフライン状態の監視
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // オンライン復帰時に同期を試みる
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // IndexedDB からペンディング中のアクティビティを取得
  const loadPendingActivities = useCallback(async () => {
    try {
      const db = await openDatabase();
      const activities = await getAllPendingActivities(db);
      setPendingActivities(activities);
    } catch (error) {
      console.error("Failed to load pending activities:", error);
    }
  }, []);

  // アクティビティをキューに追加
  const addPendingActivity = useCallback(
    async (type: PendingActivity["type"], data: Record<string, unknown>) => {
      const activity: PendingActivity = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        data,
        timestamp: Date.now(),
        synced: false,
      };

      try {
        const db = await openDatabase();
        await savePendingActivity(db, activity);
        setPendingActivities((prev) => [...prev, activity]);

        // オンライン状態なら即座に同期を試みる
        if (isOnline) {
          triggerSync();
        }
      } catch (error) {
        console.error("Failed to save pending activity:", error);
      }
    },
    [isOnline]
  );

  // 同期を実行
  const triggerSync = useCallback(async () => {
    if (syncingRef.current || !isOnline) return;

    syncingRef.current = true;
    setIsSyncing(true);
    try {
      const db = await openDatabase();
      const activities = await getAllPendingActivities(db);

      for (const activity of activities) {
        if (conflictActivityIds.includes(activity.id)) continue;
        try {
          // サーバーに送信
          const response = await fetch("/api/trpc/activities.create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(activity.data),
          });

          if (response.ok) {
            // 成功したらデータベースから削除
            await deletePendingActivity(db, activity.id);
            setPendingActivities((prev) =>
              prev.filter((a) => a.id !== activity.id)
            );
            setConflictActivityIds((previous) => previous.filter((id) => id !== activity.id));
          } else if (response.status === 409) {
            // 競合した操作は自動再送しない。最新情報を確認してから本人が操作をやり直す。
            setConflictActivityIds((previous) => previous.includes(activity.id) ? previous : [...previous, activity.id]);
          }
        } catch (error) {
          console.error("Failed to sync activity:", error);
        }
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [conflictActivityIds, isOnline]);

  // 初期化時にペンディング中のアクティビティを読み込む
  useEffect(() => {
    loadPendingActivities();
  }, [loadPendingActivities]);

  return {
    isOnline,
    pendingActivities,
    isSyncing,
    conflictActivityIds,
    addPendingActivity,
    triggerSync,
  };
}

/**
 * IndexedDB 操作
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("kizuna-sync", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pending-activities")) {
        db.createObjectStore("pending-activities", { keyPath: "id" });
      }
    };
  });
}

function getAllPendingActivities(db: IDBDatabase): Promise<PendingActivity[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-activities"], "readonly");
    const store = transaction.objectStore("pending-activities");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function savePendingActivity(
  db: IDBDatabase,
  activity: PendingActivity
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-activities"], "readwrite");
    const store = transaction.objectStore("pending-activities");
    const request = store.add(activity);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function deletePendingActivity(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-activities"], "readwrite");
    const store = transaction.objectStore("pending-activities");
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
