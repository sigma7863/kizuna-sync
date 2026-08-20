import { describe, expect, it } from "vitest";
import { bookmarkSourceLabels, countCompletedPromises, getMondayKey, talkTimingLabels } from "../shared/familyGentleConnection";

describe("phase 37 gentle family connection", () => {
  it("uses Monday for the current promise week and counts gentle completions", () => {
    expect(getMondayKey(new Date("2026-08-23T12:00:00"))).toBe("2026-08-17");
    expect(countCompletedPromises([{ isCompleted: true }, { isCompleted: false }, { isCompleted: true }])).toBe(2);
  });

  it("provides clear timing and bookmark source labels", () => {
    expect(talkTimingLabels.later).toBe("あとで話したい");
    expect(bookmarkSourceLabels.photo).toBe("写真");
  });
});
