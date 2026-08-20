import { describe, expect, it } from "vitest";
import { countReadyRelays, getWeekStartKey } from "../shared/familyDailyContinuity";

describe("phase 45 daily continuity", () => {
  it("creates a Monday week key", () => {
    expect(getWeekStartKey(new Date("2026-08-20T12:00:00Z"))).toBe("2026-08-17");
  });

  it("counts prepared relay steps", () => {
    expect(countReadyRelays([{ isReady: true }, { isReady: false }, { isReady: true }])).toBe(2);
  });
});
