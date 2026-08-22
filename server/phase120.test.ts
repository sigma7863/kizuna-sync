import { describe, expect, it } from "vitest";
import { shouldLoadFamilyDailyLifeTools } from "../shared/familyPerformance";

describe("phase 120 family performance contracts", () => {
  it("loads the deferred daily tool chunk only after an explicit request outside low-data mode", () => {
    expect(shouldLoadFamilyDailyLifeTools(false, false)).toBe(false);
    expect(shouldLoadFamilyDailyLifeTools(true, true)).toBe(false);
    expect(shouldLoadFamilyDailyLifeTools(true, false)).toBe(true);
  });
});
