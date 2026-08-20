import { describe, expect, it } from "vitest";
import { getMonthKey, getTomorrowRange, guideCategoryLabels, tomorrowKindLabels } from "../shared/familyTomorrowFlow";

describe("phase 36 tomorrow and family guide flow", () => {
  it("builds the following-day range and the current month key", () => {
    const range = getTomorrowRange(new Date("2026-08-20T12:00:00"));
    expect(range.start.toISOString()).toContain("2026-08-21");
    expect(getMonthKey(new Date("2026-08-20T12:00:00"))).toBe("2026-08");
  });

  it("exposes clear labels for tomorrow memos and family guides", () => {
    expect(tomorrowKindLabels.care).toBe("気づかい");
    expect(guideCategoryLabels.device).toBe("端末");
  });
});
