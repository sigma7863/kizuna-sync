import { and, desc, eq, isNull } from "drizzle-orm";
import { familyMembers, notifications, notificationSettings, pushSubscriptions } from "../drizzle/schema";
import { getDb } from "./db";
import { broadcastFamilyNotification } from "./websocket-integration";

export type NotificationKind =
  | "calendar_event"
  | "achievement"
  | "reward"
  | "safety"
  | "assistant"
  | "activity";

export interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationKind;
  familyGroupId: number;
  payload?: Record<string, unknown>;
  quiet?: boolean;
  excludeUserId?: number;
}

export interface NotificationEvent {
  id: number;
  userId: number;
  familyGroupId: number;
  type: NotificationKind;
  title: string;
  message: string;
  payload: Record<string, unknown>;
  quiet: boolean;
  createdAt: Date;
}

export type MemberRole = "guardian" | "child" | "elderly";

export interface NotificationSettingsInput {
  memberRole: MemberRole;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  bannerEnabled: boolean;
  quietMode: boolean;
}

const roleDefaults: Record<MemberRole, Omit<NotificationSettingsInput, "memberRole">> = {
  guardian: { vibrationEnabled: true, soundEnabled: false, bannerEnabled: true, quietMode: true },
  child: { vibrationEnabled: true, soundEnabled: false, bannerEnabled: true, quietMode: true },
  elderly: { vibrationEnabled: true, soundEnabled: true, bannerEnabled: true, quietMode: false },
};

export async function getNotificationSettings(userId: number, familyGroupId: number): Promise<NotificationSettingsInput> {
  const db = await getDb();
  if (!db) return { memberRole: "guardian", ...roleDefaults.guardian };
  const memberRows = await db
    .select({ memberRole: familyMembers.memberRole })
    .from(familyMembers)
    .where(and(eq(familyMembers.userId, userId), eq(familyMembers.familyGroupId, familyGroupId)))
    .limit(1);
  const memberRole = (memberRows[0]?.memberRole ?? "guardian") as MemberRole;
  const rows = await db
    .select()
    .from(notificationSettings)
    .where(and(eq(notificationSettings.userId, userId), eq(notificationSettings.familyGroupId, familyGroupId)))
    .limit(1);
  const row = rows[0];
  return {
    memberRole,
    ...roleDefaults[memberRole],
    ...(row
      ? {
          vibrationEnabled: row.vibrationEnabled,
          soundEnabled: row.soundEnabled,
          bannerEnabled: row.bannerEnabled,
          quietMode: row.quietMode,
        }
      : {}),
  };
}

export async function updateNotificationSettings(
  userId: number,
  familyGroupId: number,
  input: Omit<NotificationSettingsInput, "memberRole"> & { memberRole?: MemberRole }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const memberRows = await db
    .select({ memberRole: familyMembers.memberRole })
    .from(familyMembers)
    .where(and(eq(familyMembers.userId, userId), eq(familyMembers.familyGroupId, familyGroupId)))
    .limit(1);
  const memberRole = (memberRows[0]?.memberRole ?? input.memberRole ?? "guardian") as MemberRole;
  const values = {
    memberRole,
    vibrationEnabled: input.vibrationEnabled,
    soundEnabled: memberRole === "child" ? false : input.soundEnabled,
    bannerEnabled: input.bannerEnabled,
    quietMode: memberRole === "elderly" ? false : input.quietMode,
  };
  const existing = await db
    .select({ id: notificationSettings.id })
    .from(notificationSettings)
    .where(and(eq(notificationSettings.userId, userId), eq(notificationSettings.familyGroupId, familyGroupId)))
    .limit(1);
  if (existing[0]) {
    await db.update(notificationSettings).set(values).where(eq(notificationSettings.id, existing[0].id));
  } else {
    await db.insert(notificationSettings).values({ userId, familyGroupId, ...values });
  }
  return values;
}

export async function createFamilyNotification(input: NotificationPayload): Promise<NotificationEvent[]> {
  const db = await getDb();
  if (!db) return [];

  const members = await db
    .select({ userId: familyMembers.userId })
    .from(familyMembers)
    .where(eq(familyMembers.familyGroupId, input.familyGroupId));

  const events: NotificationEvent[] = [];
  for (const member of members) {
    if (member.userId === input.excludeUserId) continue;

    const createdAt = new Date();
    const result = await db.insert(notifications).values({
      userId: member.userId,
      familyGroupId: input.familyGroupId,
      type: input.type,
      title: input.title,
      message: input.message,
      payload: input.payload ?? {},
      quiet: input.quiet ?? true,
      createdAt,
    });

    const event: NotificationEvent = {
      id: Number((result as { insertId?: number }).insertId ?? 0),
      userId: member.userId,
      familyGroupId: input.familyGroupId,
      type: input.type,
      title: input.title,
      message: input.message,
      payload: input.payload ?? {},
      quiet: input.quiet ?? true,
      createdAt,
    };
    events.push(event);
    broadcastFamilyNotification(event);
  }

  return events;
}

export async function getUserNotifications(userId: number, familyGroupId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.familyGroupId, familyGroupId)
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(Math.min(Math.max(limit, 1), 100));
}

export async function getUnreadNotificationCount(userId: number, familyGroupId: number) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.familyGroupId, familyGroupId),
        isNull(notifications.readAt)
      )
    );
  return rows.length;
}

export async function markNotificationRead(userId: number, notificationId: number) {
  const db = await getDb();
  if (!db) return false;
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  return true;
}

export async function markAllNotificationsRead(userId: number, familyGroupId: number) {
  const db = await getDb();
  if (!db) return false;
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.familyGroupId, familyGroupId),
        isNull(notifications.readAt)
      )
    );
  return true;
}

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function savePushSubscription(userId: number, subscription: PushSubscriptionJSON) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(pushSubscriptions).values({
    userId,
    endpoint: subscription.endpoint,
    auth: subscription.keys.auth,
    p256dh: subscription.keys.p256dh,
  });
}

export async function getPushSubscriptions(userId: number): Promise<PushSubscriptionJSON[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  return rows.map((row) => ({
    endpoint: row.endpoint,
    keys: { auth: row.auth, p256dh: row.p256dh },
  }));
}

export async function getFamilyPushSubscriptions(familyGroupId: number, excludeUserId?: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ userId: familyMembers.userId, endpoint: pushSubscriptions.endpoint, auth: pushSubscriptions.auth, p256dh: pushSubscriptions.p256dh })
    .from(familyMembers)
    .innerJoin(pushSubscriptions, eq(pushSubscriptions.userId, familyMembers.userId))
    .where(eq(familyMembers.familyGroupId, familyGroupId));
  return rows
    .filter((row) => row.userId !== excludeUserId)
    .map((row) => ({
      userId: row.userId,
      subscription: { endpoint: row.endpoint, keys: { auth: row.auth, p256dh: row.p256dh } },
    }));
}

export async function sendFamilyNotification(
  familyGroupId: number,
  payload: Omit<NotificationPayload, "familyGroupId">,
  excludeUserId?: number
) {
  return createFamilyNotification({ ...payload, familyGroupId, excludeUserId });
}

export async function sendActivityNotification(
  familyGroupId: number,
  userId: number,
  activityType: string,
  activityData: Record<string, unknown>
) {
  const labels: Record<string, string> = {
    walking: "歩いています",
    photo: "写真を撮りました",
    music: "音楽を聴いています",
    location_arrived: "到着しました",
    location_left: "出発しました",
  };
  return sendFamilyNotification(
    familyGroupId,
    {
      type: "activity",
      title: "家族からのお知らせ",
      message: labels[activityType] ?? "アクティビティがあります",
      payload: { activityType, ...activityData },
      quiet: true,
    },
    userId
  );
}
