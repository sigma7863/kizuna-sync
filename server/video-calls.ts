import { eq, and } from 'drizzle-orm';
import { getDb } from './db';
import { int, mysqlTable, varchar, timestamp, text, mysqlEnum } from 'drizzle-orm/mysql-core';

// Video call sessions table
export const videoCallSessions = mysqlTable('video_call_sessions', {
  id: int('id').autoincrement().primaryKey(),
  familyGroupId: int('familyGroupId').notNull(),
  initiatorId: int('initiatorId').notNull(),
  sessionToken: varchar('sessionToken', { length: 255 }).notNull().unique(),
  status: mysqlEnum('status', ['initiating', 'active', 'ended']).default('initiating').notNull(),
  startedAt: timestamp('startedAt').defaultNow().notNull(),
  endedAt: timestamp('endedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Video call participants
export const videoCallParticipants = mysqlTable('video_call_participants', {
  id: int('id').autoincrement().primaryKey(),
  sessionId: int('sessionId').notNull(),
  userId: int('userId').notNull(),
  joinedAt: timestamp('joinedAt').defaultNow().notNull(),
  leftAt: timestamp('leftAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export async function createVideoCallSession(
  familyGroupId: number,
  initiatorId: number
): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const sessionToken = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.insert(videoCallSessions).values({
    familyGroupId,
    initiatorId,
    sessionToken,
  });

  return sessionToken;
}

export async function getActiveCallSession(familyGroupId: number) {
  const db = await getDb();
  if (!db) return null;

  const sessions = await db
    .select()
    .from(videoCallSessions)
    .where(
      and(
        eq(videoCallSessions.familyGroupId, familyGroupId),
        eq(videoCallSessions.status, 'active')
      )
    )
    .limit(1);

  return sessions.length > 0 ? sessions[0] : null;
}

export async function addParticipant(sessionId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.insert(videoCallParticipants).values({
    sessionId,
    userId,
  });
}

export async function endVideoCall(sessionId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(videoCallSessions)
    .set({ status: 'ended', endedAt: new Date() })
    .where(eq(videoCallSessions.id, sessionId));
}
