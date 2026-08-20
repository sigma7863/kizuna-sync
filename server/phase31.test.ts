import { describe, expect, it } from "vitest";
import { getGoalCompletionRate, getMonthKey, getQuietStateLabel } from "../shared/familyMindfulMoments";

describe("phase 31 mindful family moments", () => {
  it("uses stable monthly keys and goal progress", () => {
    expect(getMonthKey(new Date("2026-08-20T00:00:00Z"))).toBe("2026-08");
    expect(getGoalCompletionRate([{ isCompleted: true }, { isCompleted: false }, { isCompleted: true }])).toBe(67);
  });
  it("labels quiet time with gentle language", () => {
    expect(getQuietStateLabel("focus")).toBe("集中中");
    expect(getQuietStateLabel("sleeping")).toBe("おやすみ中");
  });
});
