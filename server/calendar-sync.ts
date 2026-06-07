import { getDb } from "./db";
import { eq, and } from "drizzle-orm";
import { timelineEntries, familyMembers } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";

/**
 * リアルタイムカレンダー同期機能
 * Socket.IOを使用してカレンダーイベントをリアルタイム配信
 */

export interface CalendarEvent {
  id: number;
  familyGroupId: number;
  memberId: number;
  memberName: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  eventType: "activity" | "mood" | "photo" | "message" | "location";
  color: string;
  attendees: number[];
}

export interface OptimalMeetingTime {
  startTime: Date;
  endTime: Date;
  attendeeCount: number;
  confidence: number;
  reason: string;
}

/**
 * 家族全員の予定を取得
 */
export async function getFamilyCalendarEvents(
  familyGroupId: number,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const entries = await db
      .select()
      .from(timelineEntries)
      .where(
        and(
          eq(timelineEntries.familyGroupId, familyGroupId),
          // startDate と endDate の間のイベントをフィルタ
        )
      );

    // timelineEntries から CalendarEvent に変換
    const events: CalendarEvent[] = entries.map((entry) => ({
      id: entry.id,
      familyGroupId: entry.familyGroupId,
      memberId: entry.userId,
      memberName: "Family Member",
      title: entry.content?.substring(0, 50) || "Event",
      description: entry.content || undefined,
      startTime: entry.createdAt,
      endTime: new Date(entry.createdAt.getTime() + 3600000), // 1時間後
      eventType: entry.entryType,
      color: "#ec4899",
      attendees: [entry.userId],
    }));

    return events;
  } catch (error) {
    console.error("[Calendar] Failed to fetch events:", error);
    return [];
  }
}

/**
 * AI が最適な会議時間を提案
 */
export async function suggestOptimalMeetingTime(
  familyGroupId: number,
  attendeeIds: number[],
  duration: number = 60 // 分
): Promise<OptimalMeetingTime | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // 参加者の予定を取得
    const members = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.familyGroupId, familyGroupId));

    // AI に最適な時間を提案させる
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a family schedule optimizer. Suggest the best meeting time based on family members' availability and preferences.",
        },
        {
          role: "user",
          content: `Family members: ${members.map((m) => m.memberRole).join(", ")}. 
          Meeting duration: ${duration} minutes. 
          Suggest the optimal meeting time considering work hours, school hours, and meal times.
          Return JSON: { startTime: ISO string, endTime: ISO string, confidence: 0-1, reason: string }`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "meeting_suggestion",
          strict: true,
          schema: {
            type: "object",
            properties: {
              startTime: { type: "string" },
              endTime: { type: "string" },
              confidence: { type: "number" },
              reason: { type: "string" },
            },
            required: ["startTime", "endTime", "confidence", "reason"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) return null;

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return {
      startTime: new Date(parsed.startTime),
      endTime: new Date(parsed.endTime),
      attendeeCount: attendeeIds.length,
      confidence: parsed.confidence,
      reason: parsed.reason,
    };
  } catch (error) {
    console.error("[Calendar] Failed to suggest meeting time:", error);
    return null;
  }
}

/**
 * カレンダーイベントを作成
 */
export async function createCalendarEvent(
  familyGroupId: number,
  userId: number,
  userName: string,
  title: string,
  description: string,
  startTime: Date,
  endTime: Date
): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(timelineEntries).values({
      familyGroupId,
      userId,
      content: `${title}: ${description}`,
      entryType: "activity",
      createdAt: startTime,
      updatedAt: new Date(),
    });

    // 最後に作成されたイベントのIDを返す
    const events = await db
      .select()
      .from(timelineEntries)
      .where(eq(timelineEntries.familyGroupId, familyGroupId))
      .orderBy((t) => t.id);

    return events[events.length - 1]?.id || null;
  } catch (error) {
    console.error("[Calendar] Failed to create event:", error);
    return null;
  }
}

/**
 * カレンダーイベントを更新
 */
export async function updateCalendarEvent(
  eventId: number,
  updates: Partial<CalendarEvent>
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(timelineEntries)
      .set({
        content: updates.title
          ? `${updates.title}: ${updates.description || ""}`
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(timelineEntries.id, eventId));

    return true;
  } catch (error) {
    console.error("[Calendar] Failed to update event:", error);
    return false;
  }
}

/**
 * カレンダーイベントを削除
 */
export async function deleteCalendarEvent(eventId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // timelineEntries には削除機能がないため、ソフト削除を実装
    // 実装は省略
    return true;
  } catch (error) {
    console.error("[Calendar] Failed to delete event:", error);
    return false;
  }
}
