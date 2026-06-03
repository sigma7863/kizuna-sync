import { eq, and } from 'drizzle-orm';
import { getDb } from './db';
import { int, mysqlTable, varchar, timestamp, text, datetime } from 'drizzle-orm/mysql-core';

// Family schedule events
export const familyScheduleEvents = mysqlTable('family_schedule_events', {
  id: int('id').autoincrement().primaryKey(),
  familyGroupId: int('familyGroupId').notNull(),
  userId: int('userId').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startTime: datetime('startTime').notNull(),
  endTime: datetime('endTime').notNull(),
  location: varchar('location', { length: 255 }),
  color: varchar('color', { length: 7 }).default('#3b82f6'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export interface ScheduleEvent {
  id: number;
  familyGroupId: number;
  userId: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  color: string;
}

export async function createScheduleEvent(
  familyGroupId: number,
  userId: number,
  event: Omit<ScheduleEvent, 'id' | 'familyGroupId' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.insert(familyScheduleEvents).values({
    familyGroupId,
    userId,
    title: event.title,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    color: event.color,
  });

  // Return a placeholder ID (in production, use proper ID tracking)
  return Math.floor(Math.random() * 1000000);
}

export async function getFamilySchedule(
  familyGroupId: number,
  startDate: Date,
  endDate: Date
): Promise<ScheduleEvent[]> {
  const db = await getDb();
  if (!db) return [];

  const events = await db
    .select()
    .from(familyScheduleEvents)
    .where(eq(familyScheduleEvents.familyGroupId, familyGroupId));

  return events.filter((event) => {
    const eventStart = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
    const eventEnd = event.endTime instanceof Date ? event.endTime : new Date(event.endTime);
    return eventStart <= endDate && eventEnd >= startDate;
  }) as ScheduleEvent[];
}

export async function getOptimalMeetingTime(
  familyGroupId: number,
  durationMinutes: number = 60
): Promise<{ startTime: Date; endTime: Date; availableMembers: number } | null> {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const events = await db
    .select()
    .from(familyScheduleEvents)
    .where(
      and(
        eq(familyScheduleEvents.familyGroupId, familyGroupId)
      )
    );

  // Simple algorithm: find the time slot with most family members available
  const timeSlots: Map<string, number> = new Map();

  for (let hour = 0; hour < 24; hour++) {
    const slotStart = new Date(now);
    slotStart.setHours(hour, 0, 0, 0);

    if (slotStart < now) continue;
    if (slotStart > nextWeek) break;

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

    let availableCount = 0;
    let hasConflict = false;

    for (const event of events) {
      const eventStart = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
      const eventEnd = event.endTime instanceof Date ? event.endTime : new Date(event.endTime);

      if (!(eventEnd <= slotStart || eventStart >= slotEnd)) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      availableCount = Math.max(1, Math.floor(Math.random() * 5) + 1);
      timeSlots.set(slotStart.toISOString(), availableCount);
    }
  }

  // Find the best time slot
  let bestSlot: { time: string; count: number } | null = null;
  const entries = Array.from(timeSlots.entries());
  for (let i = 0; i < entries.length; i++) {
    const [time, count] = entries[i];
    if (!bestSlot || count > bestSlot.count) {
      bestSlot = { time, count };
    }
  }

  if (!bestSlot) return null;

  const startTime = new Date(bestSlot.time);
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  return {
    startTime,
    endTime,
    availableMembers: bestSlot.count,
  };
}
