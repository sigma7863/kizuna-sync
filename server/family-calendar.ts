import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import { familyMembers, timelineEntries } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";

export interface CalendarEvent {
  id: number;
  familyGroupId: number;
  memberId: number;
  memberName: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  category: string;
  color: string;
  createdAt: Date;
}

export interface OptimalMeetingTime {
  startTime: Date;
  endTime: Date;
  availableMembers: number;
  conflictingMembers: string[];
  confidence: number;
  reason: string;
}

/**
 * 家族全員のスケジュールを取得
 */
export async function getFamilyCalendar(
  familyGroupId: number,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const events = await db
    .select()
    .from(timelineEntries)
    .where(
      and(
        eq(timelineEntries.familyGroupId, familyGroupId),
        gte(timelineEntries.createdAt, startDate),
        lte(timelineEntries.createdAt, endDate)
      )
    );

  return events.map((e, idx) => ({
    id: e.id,
    familyGroupId: e.familyGroupId,
    memberId: e.userId,
    memberName: "Family Member",
    title: `${e.entryType} entry`,
    description: e.content || undefined,
    startTime: e.createdAt,
    endTime: new Date(e.createdAt.getTime() + 60 * 60 * 1000),
    category: e.entryType,
    color: `hsl(${(idx * 137.5) % 360}, 70%, 60%)`,
    createdAt: e.createdAt,
  }));
}

/**
 * 最適な家族会議時間をAIが提案
 */
export async function suggestOptimalMeetingTime(
  familyGroupId: number,
  duration: number = 60,
  daysAhead: number = 7
): Promise<OptimalMeetingTime> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 今後7日間のスケジュールを取得
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const events = await db
    .select()
    .from(timelineEntries)
    .where(
      and(
        eq(timelineEntries.familyGroupId, familyGroupId),
        gte(timelineEntries.createdAt, now),
        lte(timelineEntries.createdAt, futureDate)
      )
    );

  // AIに最適時間を提案させる
  const calendarSummary = events
    .map((e) => `${e.entryType} at ${e.createdAt.toLocaleTimeString()}`)
    .join(", ");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a family scheduling assistant. Analyze the family's calendar and suggest the optimal time for a ${duration}-minute family meeting. Consider work hours, meal times, and existing commitments. Respond with JSON: { "startTime": "HH:MM", "dayOffset": 0-7, "confidence": 0-100, "reason": "explanation" }`,
      },
      {
        role: "user",
        content: `Family calendar for next ${daysAhead} days: ${calendarSummary || "No events"}. Suggest best time for a ${duration}-minute meeting.`,
      },
    ],
  });

  const suggestion = JSON.parse(
    (response.choices[0]?.message.content as string) || "{}"
  );
  const meetingDate = new Date(
    now.getTime() + (suggestion.dayOffset || 1) * 24 * 60 * 60 * 1000
  );
  const [hours, minutes] = (suggestion.startTime || "18:00")
    .split(":")
    .map(Number);
  meetingDate.setHours(hours, minutes, 0, 0);

  return {
    startTime: meetingDate,
    endTime: new Date(meetingDate.getTime() + duration * 60 * 1000),
    availableMembers: Math.max(1, Math.ceil((events.length * 3) / 4)),
    conflictingMembers: [],
    confidence: suggestion.confidence || 75,
    reason: suggestion.reason || "Optimal time based on family schedule",
  };
}

/**
 * カレンダーイベントを作成
 */
export async function createCalendarEvent(
  familyGroupId: number,
  memberId: number,
  title: string,
  description: string,
  startTime: Date,
  endTime: Date,
  category: "mood" | "photo" | "message" | "location" | "activity"
): Promise<CalendarEvent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(timelineEntries).values({
    familyGroupId,
    userId: memberId,
    entryType: category,
    content: description,
    createdAt: startTime,
  });

  const eventId = Math.floor(Math.random() * 10000);

  return {
    id: eventId,
    familyGroupId,
    memberId,
    memberName: "Family Member",
    title,
    description,
    startTime,
    endTime,
    category,
    color: `hsl(${(eventId * 137.5) % 360}, 70%, 60%)`,
    createdAt: new Date(),
  };
}

/**
 * 家族全員の可用性を分析
 */
export async function analyzeFamilyAvailability(
  familyGroupId: number,
  proposedTime: Date,
  duration: number
): Promise<{
  totalMembers: number;
  availableMembers: number;
  busyMembers: string[];
  availabilityPercentage: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const members = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.familyGroupId, familyGroupId));

  const conflictingEvents = await db
    .select()
    .from(timelineEntries)
    .where(
      and(
        eq(timelineEntries.familyGroupId, familyGroupId),
        gte(timelineEntries.createdAt, proposedTime),
        lte(
          timelineEntries.createdAt,
          new Date(proposedTime.getTime() + duration * 60 * 1000)
        )
      )
    );

  const busyMemberIds = new Set(conflictingEvents.map((e) => e.userId));
  const busyMembers = members
    .filter((m) => busyMemberIds.has(m.userId))
    .map((m) => m.memberRole);

  return {
    totalMembers: members.length,
    availableMembers: members.length - busyMembers.length,
    busyMembers,
    availabilityPercentage: Math.round(
      ((members.length - busyMembers.length) / members.length) * 100
    ),
  };
}
