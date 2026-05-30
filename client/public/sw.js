/**
 * KizunaSync Service Worker
 * オフライン対応とバックグラウンド同期を実装
 */

const CACHE_NAME = "kizuna-sync-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.ico",
];

// Service Worker インストール
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Failed to cache static assets:", err);
      });
    })
  );
  self.skipWaiting();
});

// Service Worker アクティベート
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// リクエスト処理
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API リクエストの場合
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 静的アセットの場合
  event.respondWith(handleStaticRequest(request));
});

/**
 * API リクエストの処理
 * オンライン時はネットワークから取得、オフライン時はキャッシュから取得
 */
async function handleApiRequest(request) {
  try {
    // ネットワークから取得を試みる
    const response = await fetch(request);

    // 成功したレスポンスをキャッシュに保存
    if (response.ok && request.method === "GET") {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // ネットワークエラー時はキャッシュから取得
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // キャッシュもない場合はオフラインレスポンスを返す
    return new Response(
      JSON.stringify({
        error: "offline",
        message: "オフライン中です。接続を確認してください。",
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * 静的アセットの処理
 * キャッシュファースト戦略を使用
 */
async function handleStaticRequest(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    // 成功したレスポンスをキャッシュに保存
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // オフラインで静的アセットが見つからない場合
    return new Response("Not found", { status: 404 });
  }
}

/**
 * バックグラウンド同期
 * オフライン中に実行されたアクションをオンライン復帰時に同期
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-activities") {
    event.waitUntil(syncActivities());
  }
});

async function syncActivities() {
  try {
    // IndexedDB からペンディング中のアクティビティを取得
    const db = await openDatabase();
    const pendingActivities = await getPendingActivities(db);

    // サーバーに送信
    for (const activity of pendingActivities) {
      try {
        await fetch("/api/trpc/activities.create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activity),
        });

        // 成功したらデータベースから削除
        await deletePendingActivity(db, activity.id);
      } catch (error) {
        console.error("Failed to sync activity:", error);
      }
    }
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}

/**
 * IndexedDB 操作
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("kizuna-sync", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pending-activities")) {
        db.createObjectStore("pending-activities", { keyPath: "id" });
      }
    };
  });
}

function getPendingActivities(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-activities"], "readonly");
    const store = transaction.objectStore("pending-activities");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deletePendingActivity(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-activities"], "readwrite");
    const store = transaction.objectStore("pending-activities");
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
