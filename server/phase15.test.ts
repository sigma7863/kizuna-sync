import { describe, expect, it } from "vitest";
import { formatGratitudeContent } from "../shared/gratitude";
import { buildWeeklyPulse } from "../shared/weeklyPulse";

describe("phase 15 family help, gratitude, and weekly pulse", () => {
  it("formats a gratitude relay message with the selected stamp", () => {
    expect(formatGratitudeContent("  手伝ってくれてありがとう ", "🫶")).toBe("🫶 ありがとう：手伝ってくれてありがとう");
    expect(formatGratitudeContent("いつもありがとう")).toBe("💐 ありがとう：いつもありがとう");
  });

  it("counts weekly posts, check-ins, photos, and health into a capped pulse", () => {
    const result = buildWeeklyPulse({
      now: new Date("2026-08-20T12:00:00"),
      timeline: [
        { createdAt: new Date("2026-08-20T09:00:00"), metadata: { isCheckIn: true } },
        { createdAt: new Date("2026-08-18T09:00:00"), metadata: {} },
        { createdAt: new Date("2026-08-10T09:00:00"), metadata: {} },
      ],
      albumPhotos: [{ createdAt: new Date("2026-08-19T09:00:00") }],
      health: [{ steps: 3200 }, { steps: 2100 }],
    });
    expect(result).toEqual({ score: 46, posts: 2, checkIns: 1, photos: 1, totalSteps: 5300, activeMembers: 2 });
  });
});
