import { describe, expect, it } from "vitest";
import { matchesAlbumSearch } from "../shared/album";
import { buildCheckInContent, buildCheckInMetadata } from "../shared/checkin";
import { buildTodayKizunaHighlights } from "../shared/familyHighlights";

describe("phase 14 family reassurance, memory search, and daily highlights", () => {
  it("builds a safe default check-in and structured metadata", () => {
    expect(buildCheckInContent()).toBe("大丈夫です。安心してね。");
    expect(buildCheckInContent("  帰宅しました  ")).toBe("帰宅しました");
    expect(buildCheckInMetadata()).toEqual({ isCheckIn: true, status: "okay" });
  });

  it("finds photo memories by AI description and tags", () => {
    const photo = { fileName: "family-day.jpg", description: "公園で笑う家族", tags: ["公園", "笑顔", "休日"] };
    expect(matchesAlbumSearch(photo, "公園")).toBe(true);
    expect(matchesAlbumSearch(photo, "笑顔")).toBe(true);
    expect(matchesAlbumSearch(photo, "海")).toBe(false);
  });

  it("summarizes only today entries and combines live activity metrics", () => {
    const now = new Date("2026-08-20T12:00:00");
    const result = buildTodayKizunaHighlights({
      now,
      timeline: [
        { id: 1, createdAt: new Date("2026-08-20T09:00:00"), content: "おはよう" },
        { id: 2, createdAt: new Date("2026-08-19T23:00:00"), content: "昨日の記録" },
      ],
      locations: [{ userId: 1 }, { userId: 2 }],
      health: [{ userId: 2, steps: 3400 }, { userId: 3, steps: 2100 }],
    });
    expect(result.entries.map((entry) => entry.id)).toEqual([1]);
    expect(result.activeMemberCount).toBe(3);
    expect(result.locationCount).toBe(2);
    expect(result.totalSteps).toBe(5500);
  });
});
