import { beforeEach, describe, expect, it, vi } from "vitest";

const getFamilyTimelineMock = vi.fn();
const getDbMock = vi.fn();
const invokeLLMMock = vi.fn();

vi.mock("./db", () => ({
  getFamilyTimeline: getFamilyTimelineMock,
  getDb: getDbMock,
}));
vi.mock("./_core/llm", () => ({ invokeLLM: invokeLLMMock }));
vi.mock("./notifications", () => ({ createFamilyNotification: vi.fn() }));

describe("family AI assistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFamilyTimelineMock.mockResolvedValue([
      { id: 1, entryType: "message", content: "週末は公園へ行きました", createdAt: new Date("2026-08-15T09:00:00Z") },
      { id: 2, entryType: "mood", content: "今日は元気です", createdAt: new Date("2026-08-16T09:00:00Z") },
    ]);
  });

  it("returns structured schedule proposals without executing them", async () => {
    invokeLLMMock.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({
        intent: "create_schedule",
        message: "週末の公園を予定として提案します。",
        action: {
          type: "create_schedule",
          title: "家族で公園",
          description: "みんなで公園に行く",
          startTime: "2026-08-22T10:00:00.000Z",
          endTime: "2026-08-22T12:00:00.000Z",
          location: "中央公園",
        },
        requiresConfirmation: true,
      }) } }],
    });

    const { getFamilyAssistantResponse } = await import("./family-assistant");
    const result = await getFamilyAssistantResponse({ familyGroupId: 3, message: "土曜に公園の予定を作って", language: "ja" });

    expect(result.intent).toBe("create_schedule");
    expect(result.requiresConfirmation).toBe(true);
    expect(result.action?.title).toBe("家族で公園");
  });

  it("falls back to deterministic timeline search when the AI service is unavailable", async () => {
    invokeLLMMock.mockRejectedValue(new Error("temporary service error"));

    const { getFamilyAssistantResponse } = await import("./family-assistant");
    const result = await getFamilyAssistantResponse({ familyGroupId: 3, message: "公園", language: "ja" });

    expect(result.intent).toBe("search_timeline");
    expect(result.requiresConfirmation).toBe(false);
    expect(result.searchResults).toHaveLength(1);
    expect(result.searchResults[0].content).toContain("公園");
  });

  it("rejects invalid schedule actions before writing to the database", async () => {
    const { confirmFamilySchedule } = await import("./family-assistant");

    await expect(confirmFamilySchedule({
      familyGroupId: 3,
      userId: 9,
      action: {
        type: "create_schedule",
        title: "不正な予定",
        description: "",
        startTime: "2026-08-22T12:00:00.000Z",
        endTime: "2026-08-22T10:00:00.000Z",
        location: "",
      },
    })).rejects.toThrow("Invalid schedule action");
    expect(getDbMock).not.toHaveBeenCalled();
  });
});
