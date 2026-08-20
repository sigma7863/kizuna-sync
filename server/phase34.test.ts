import { describe, expect, it } from "vitest";
import { countAvailableSupporters, getReminderTone, getWeekKey } from "../shared/familyWeeklyCare";

describe("phase 34 weekly family care", () => {
  it("uses Monday as the weekly reflection key", () => { expect(getWeekKey(new Date("2026-08-20T12:00:00"))).toBe("2026-08-17"); });
  it("summarizes helpers and uses gentle reminder tones", () => {
    expect(countAvailableSupporters([{ strengths: ["料理"] }, { strengths: [] }])).toBe(1);
    expect(getReminderTone()).toBe("gentle");
  });
});
