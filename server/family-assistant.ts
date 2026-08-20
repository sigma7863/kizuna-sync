import { and, desc, eq } from "drizzle-orm";
import { familyScheduleEvents } from "../drizzle/schema";
import { getDb, getFamilyTimeline } from "./db";
import { invokeLLM } from "./_core/llm";
import { createFamilyNotification } from "./notifications";

export type AssistantLanguage = "ja" | "en" | "zh" | "ko";

export interface ScheduleAction {
  type: "create_schedule" | "update_schedule" | "delete_schedule";
  eventId?: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface FamilyAssistantResult {
  intent: "search_timeline" | "create_schedule" | "update_schedule" | "delete_schedule" | "general";
  message: string;
  searchResults: Array<{ id: number; content: string; createdAt: Date }>;
  action: ScheduleAction | null;
  requiresConfirmation: boolean;
}

const languageNames: Record<AssistantLanguage, string> = {
  ja: "日本語",
  en: "English",
  zh: "简体中文",
  ko: "한국어",
};

function getSearchResults(timeline: Awaited<ReturnType<typeof getFamilyTimeline>>, message: string) {
  const tokens = message
    .toLowerCase()
    .split(/[\s、。,.!?！？]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
  if (tokens.length === 0) return [];
  return timeline
    .filter((entry) => tokens.some((token) => (entry.content ?? "").toLowerCase().includes(token)))
    .slice(0, 8)
    .map((entry) => ({
      id: entry.id,
      content: entry.content ?? "",
      createdAt: entry.createdAt,
    }));
}

function fallbackResult(language: AssistantLanguage, results: FamilyAssistantResult["searchResults"]): FamilyAssistantResult {
  const fallbackMessages: Record<AssistantLanguage, string> = {
    ja: results.length > 0 ? `${results.length}件のタイムラインを見つけました。` : "タイムラインを検索しましたが、該当する投稿は見つかりませんでした。",
    en: results.length > 0 ? `I found ${results.length} timeline entries.` : "I searched the timeline but could not find a matching entry.",
    zh: results.length > 0 ? `我找到了 ${results.length} 条时间线记录。` : "我搜索了时间线，但没有找到匹配的记录。",
    ko: results.length > 0 ? `타임라인에서 ${results.length}개의 기록을 찾았습니다.` : "타임라인을 검색했지만 일치하는 기록을 찾지 못했습니다.",
  };
  return {
    intent: "search_timeline",
    message: fallbackMessages[language],
    searchResults: results,
    action: null,
    requiresConfirmation: false,
  };
}

export async function getFamilyAssistantResponse(input: {
  familyGroupId: number;
  message: string;
  language: AssistantLanguage;
}): Promise<FamilyAssistantResult> {
  const timeline = await getFamilyTimeline(input.familyGroupId, 80);
  const searchResults = getSearchResults(timeline, input.message);
  const context = timeline.slice(0, 30).map((entry) => ({
    id: entry.id,
    content: entry.content ?? "",
    type: entry.entryType,
    createdAt: entry.createdAt,
  }));

  const db = await getDb();
  const existingEvents = db
    ? await db
        .select()
        .from(familyScheduleEvents)
        .where(eq(familyScheduleEvents.familyGroupId, input.familyGroupId))
        .orderBy(desc(familyScheduleEvents.startTime))
        .limit(20)
    : [];

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `あなたは家族向けの静かで安全なAIアシスタントです。回答は${languageNames[input.language]}で返してください。タイムライン検索、予定作成・更新・削除の提案、一般的な家族サポートだけを行います。予定の作成・変更・削除は必ず確認が必要なので、即時実行せず action と requiresConfirmation=true を返してください。現在時刻は ${new Date().toISOString()} です。`,
        },
        {
          role: "user",
          content: JSON.stringify({
            request: input.message,
            timeline: context,
            existingEvents,
            deterministicSearchResults: searchResults,
          }),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "family_assistant_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              intent: { type: "string", enum: ["search_timeline", "create_schedule", "update_schedule", "delete_schedule", "general"] },
              message: { type: "string" },
              action: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["create_schedule", "update_schedule", "delete_schedule"] },
                      eventId: { type: ["integer", "null"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      startTime: { type: "string" },
                      endTime: { type: "string" },
                      location: { type: "string" },
                    },
                    required: ["type", "eventId", "title", "description", "startTime", "endTime", "location"],
                    additionalProperties: false,
                  },
                  { type: "null" },
                ],
              },
              requiresConfirmation: { type: "boolean" },
            },
            required: ["intent", "message", "action", "requiresConfirmation"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (typeof content !== "string") return fallbackResult(input.language, searchResults);
    const parsed = JSON.parse(content) as Omit<FamilyAssistantResult, "searchResults">;
    return {
      intent: parsed.intent as FamilyAssistantResult["intent"],
      message: parsed.message,
      action: parsed.action as ScheduleAction | null,
      requiresConfirmation: parsed.action ? true : false,
      searchResults: parsed.intent === "search_timeline" ? searchResults : [],
    };
  } catch (error) {
    console.error("[FamilyAssistant] failed:", error);
    return fallbackResult(input.language, searchResults);
  }
}

export async function confirmFamilySchedule(input: {
  familyGroupId: number;
  userId: number;
  action: ScheduleAction;
}) {
  if (input.action.type === "delete_schedule" && !input.action.eventId) {
    throw new Error("Event ID is required for deletion");
  }

  if (input.action.type !== "delete_schedule") {
    const startTime = new Date(input.action.startTime);
    const endTime = new Date(input.action.endTime);
    if (!input.action.title.trim() || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || endTime <= startTime) {
      throw new Error("Invalid schedule action");
    }
  }

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (input.action.type === "delete_schedule") {
    const eventId = input.action.eventId;
    if (!eventId) throw new Error("Event ID is required for deletion");
    await db
      .delete(familyScheduleEvents)
      .where(and(eq(familyScheduleEvents.id, eventId), eq(familyScheduleEvents.familyGroupId, input.familyGroupId)));
    await createFamilyNotification({
      familyGroupId: input.familyGroupId,
      type: "calendar_event",
      title: "予定が削除されました",
      message: `${input.action.title} が削除されました`,
      payload: { eventId },
      quiet: true,
    });
    return { success: true, eventId };
  }

  const startTime = new Date(input.action.startTime);
  const endTime = new Date(input.action.endTime);

  if (input.action.type === "update_schedule") {
    if (!input.action.eventId) throw new Error("Event ID is required for update");
    await db
      .update(familyScheduleEvents)
      .set({
        title: input.action.title.trim().slice(0, 255),
        description: input.action.description.trim() || null,
        startTime,
        endTime,
        location: input.action.location.trim().slice(0, 255) || null,
      })
      .where(and(eq(familyScheduleEvents.id, input.action.eventId), eq(familyScheduleEvents.familyGroupId, input.familyGroupId)));

    await createFamilyNotification({
      familyGroupId: input.familyGroupId,
      type: "calendar_event",
      title: "予定が更新されました",
      message: `${input.action.title}（${startTime.toLocaleString("ja-JP")}）`,
      payload: { eventId: input.action.eventId, startTime: startTime.toISOString() },
      quiet: true,
    });

    return { eventId: input.action.eventId, startTime, endTime };
  }

  const result = await db.insert(familyScheduleEvents).values({
    familyGroupId: input.familyGroupId,
    userId: input.userId,
    title: input.action.title.trim().slice(0, 255),
    description: input.action.description.trim() || null,
    startTime,
    endTime,
    location: input.action.location.trim().slice(0, 255) || null,
  });

  const eventId = Number((result as { insertId?: number }).insertId ?? 0);
  await createFamilyNotification({
    familyGroupId: input.familyGroupId,
    type: "calendar_event",
    title: "予定が追加されました",
    message: `${input.action.title}（${startTime.toLocaleString("ja-JP")}）`,
    payload: { eventId, startTime: startTime.toISOString() },
    quiet: true,
  });

  return { eventId, startTime, endTime };
}

export async function getFamilyScheduleEvents(familyGroupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(familyScheduleEvents)
    .where(eq(familyScheduleEvents.familyGroupId, familyGroupId))
    .orderBy(desc(familyScheduleEvents.startTime))
    .limit(50);
}
