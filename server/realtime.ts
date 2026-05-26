import { Express, Request, Response } from "express";
import { getDb } from "./db";
import { eq, gte } from "drizzle-orm";
import { userActivities } from "../drizzle/schema";

interface RealtimeClient {
  response: Response;
  familyGroupId: number;
  lastActivityId: number;
}

// アクティブなSSE接続を管理
const realtimeClients: Map<string, RealtimeClient> = new Map();

/**
 * リアルタイム同期エンドポイントを登録
 */
export function setupRealtimeEndpoints(app: Express) {
  /**
   * SSEエンドポイント: /api/realtime/activities
   * クライアントがこのエンドポイントに接続し、リアルタイムでアクティビティを受信
   */
  app.get("/api/realtime/activities", (req: Request, res: Response) => {
    const familyGroupId = parseInt(req.query.familyGroupId as string);
    const clientId = `${req.ip}-${Date.now()}`;

    if (!familyGroupId) {
      res.status(400).json({ error: "familyGroupId is required" });
      return;
    }

    // SSEヘッダーを設定
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // クライアントを登録
    realtimeClients.set(clientId, {
      response: res,
      familyGroupId,
      lastActivityId: 0,
    });

    console.log(`[Realtime] Client connected: ${clientId}`);

    // クライアント切断時の処理
    req.on("close", () => {
      realtimeClients.delete(clientId);
      console.log(`[Realtime] Client disconnected: ${clientId}`);
    });

    // ハートビートを送信（接続を保持）
    const heartbeatInterval = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 30000);

    req.on("close", () => {
      clearInterval(heartbeatInterval);
    });
  });

  /**
   * ポーリングエンドポイント: /api/activities
   * 最新のアクティビティをポーリングで取得
   */
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const familyGroupId = parseInt(req.query.familyGroupId as string);
      const since = parseInt(req.query.since as string) || Date.now() - 60000;

      if (!familyGroupId) {
        res.status(400).json({ error: "familyGroupId is required" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      // 指定時刻以降のアクティビティを取得
      const activities = await db
        .select()
        .from(userActivities)
        .where(gte(userActivities.createdAt, new Date(since)))
        .limit(100);

      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });
}

/**
 * 新しいアクティビティをすべてのクライアントにブロードキャスト
 */
export async function broadcastActivity(
  familyGroupId: number,
  activity: {
    userId: number;
    userName: string;
    activityType: string;
    timestamp: number;
    data?: Record<string, unknown>;
  }
) {
  const eventData = `data: ${JSON.stringify(activity)}\n\n`;

  const clientsArray = Array.from(realtimeClients.entries());
  for (const [clientId, client] of clientsArray) {
    if (client.familyGroupId === familyGroupId) {
      try {
        client.response.write(`event: activity\n${eventData}`);
      } catch (error) {
        console.error(`Failed to send to client ${clientId}:`, error);
        realtimeClients.delete(clientId);
      }
    }
  }
}

/**
 * 接続中のクライアント数を取得
 */
export function getConnectedClientsCount(): number {
  return realtimeClients.size;
}

/**
 * 特定の家族グループに接続中のクライアント数を取得
 */
export function getConnectedClientsForFamily(familyGroupId: number): number {
  let count = 0;
  const clientsArray = Array.from(realtimeClients.values());
  for (const client of clientsArray) {
    if (client.familyGroupId === familyGroupId) {
      count++;
    }
  }
  return count;
}
