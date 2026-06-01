import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";

/**
 * プッシュ通知機能
 * Web Push APIを使用した家族全員への即時通知
 */

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * 家族メンバーにプッシュ通知を送信
 */
export async function sendFamilyNotification(
  familyGroupId: number,
  payload: NotificationPayload,
  excludeUserId?: number
) {
  try {
    // 家族メンバーのプッシュサブスクリプションを取得
    const subscriptions = await getPushSubscriptions(familyGroupId, excludeUserId);

    // 各メンバーに通知を送信
    const results = await Promise.allSettled(
      subscriptions.map((sub) => sendPushNotification(sub, payload))
    );

    return {
      sent: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };
  } catch (error) {
    console.error("Failed to send family notification:", error);
    throw error;
  }
}

/**
 * アクティビティ通知を送信
 * 波紋アニメーション付きで家族に通知
 */
export async function sendActivityNotification(
  familyGroupId: number,
  userId: number,
  activityType: string,
  activityData: Record<string, unknown>
) {
  const activityLabels: Record<string, string> = {
    walking: "🚶 歩いています",
    photo: "📸 写真を撮りました",
    music: "🎵 音楽を聴いています",
    location_arrived: "📍 到着しました",
    location_left: "📍 出発しました",
  };

  const payload: NotificationPayload = {
    title: "家族からのお知らせ",
    body: activityLabels[activityType] || "アクティビティがあります",
    icon: "/favicon.ico",
    badge: "/badge.png",
    tag: `activity-${userId}`,
    data: {
      type: "activity",
      familyGroupId,
      userId,
      activityType,
      ...activityData,
    },
  };

  return sendFamilyNotification(familyGroupId, payload, userId);
}

/**
 * AI生成提案の通知を送信
 */
export async function sendProposalNotification(
  familyGroupId: number,
  proposalType: "dinner" | "outing" | "activity",
  proposal: string
) {
  const proposalLabels: Record<string, string> = {
    dinner: "🍽️ 夕食の提案",
    outing: "🎉 お出かけの提案",
    activity: "🎮 家族活動の提案",
  };

  const payload: NotificationPayload = {
    title: "家族会議AI",
    body: proposalLabels[proposalType] || "提案があります",
    icon: "/favicon.ico",
    tag: `proposal-${proposalType}`,
    data: {
      type: "proposal",
      familyGroupId,
      proposalType,
      proposal,
    },
  };

  return sendFamilyNotification(familyGroupId, payload);
}

/**
 * 到着通知を送信（静かな見守り）
 */
export async function sendArrivalNotification(
  familyGroupId: number,
  userId: number,
  location: string
) {
  const payload: NotificationPayload = {
    title: "到着しました",
    body: `${location}に到着しました`,
    icon: "/favicon.ico",
    tag: `arrival-${userId}`,
    data: {
      type: "arrival",
      familyGroupId,
      userId,
      location,
    },
  };

  return sendFamilyNotification(familyGroupId, payload, userId);
}

/**
 * プッシュサブスクリプションを取得
 */
async function getPushSubscriptions(
  familyGroupId: number,
  excludeUserId?: number
): Promise<PushSubscription[]> {
  // TODO: データベースからプッシュサブスクリプションを取得
  // 現在はプレースホルダー実装
  return [];
}

/**
 * プッシュ通知を送信
 */
async function sendPushNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<void> {
  // TODO: Web Push APIを使用して実際に送信
  // 現在はプレースホルダー実装
  console.log("Sending push notification:", { subscription, payload });
}
