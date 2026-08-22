import { describe, expect, it } from "vitest";
import { shouldLoadAdditionalFamilyTools } from "../shared/familyAdditionalDailyTools";

describe("phase 109 deferred family tools", () => {
  it("loads optional daily tools only after the family explicitly opens them", () => {
    expect(shouldLoadAdditionalFamilyTools(false)).toBe(false);
    expect(shouldLoadAdditionalFamilyTools(true)).toBe(true);
  });
});
