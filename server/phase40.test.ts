import { describe, expect, it } from "vitest";
import { countDailyJoys, getLocalDayKey } from "../shared/familyDailyJoy";

describe("phase 40 daily joy and gentle support", () => {
  it("uses a local calendar day for a small family joy", () => {
    expect(getLocalDayKey(new Date("2026-08-20T12:00:00"))).toBe("2026-08-20");
  });

  it("counts only meaningful shared joys", () => {
    expect(countDailyJoys([{ joy: "帰りにパンを買う" }, { joy: "  " }, { joy: "夕食後に散歩する" }])).toBe(2);
  });
});
