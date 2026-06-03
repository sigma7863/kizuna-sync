import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { mysqlTable, varchar, text, int, timestamp } from 'drizzle-orm/mysql-core';

// Push subscription table schema
export const pushSubscriptions = mysqlTable('push_subscriptions', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  endpoint: text('endpoint').notNull(),
  auth: varchar('auth', { length: 255 }).notNull(),
  p256dh: varchar('p256dh', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export async function savePushSubscription(
  userId: number,
  subscription: PushSubscriptionJSON
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.insert(pushSubscriptions).values({
    userId,
    endpoint: subscription.endpoint,
    auth: subscription.keys.auth,
    p256dh: subscription.keys.p256dh,
  }).onDuplicateKeyUpdate({
    set: {
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
    },
  });
}

export async function getPushSubscriptions(userId: number): Promise<PushSubscriptionJSON[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  return rows.map((row) => ({
    endpoint: row.endpoint,
    keys: {
      auth: row.auth,
      p256dh: row.p256dh,
    },
  }));
}

export async function getFamilyPushSubscriptions(familyGroupId: number): Promise<
  Array<{ userId: number; subscription: PushSubscriptionJSON }>
> {
  const db = await getDb();
  if (!db) return [];

  // This would need a JOIN with family_members table
  // For now, returning empty array as placeholder
  return [];
}

export interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}
