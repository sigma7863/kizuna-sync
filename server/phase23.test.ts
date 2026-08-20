import { describe, expect, it } from "vitest";
import { formatWalkRouteEstimate, getLearningSourceLabel, normalizeRouteHighlights } from "../shared/familyWellness";

describe("phase 23 family wellness logic", () => {
  it("normalizes route highlights for compact, readable cards", () => {
    expect(normalizeRouteHighlights("川沿い、 ベンチ,川沿い\n図書館", 3)).toEqual(["川沿い", "ベンチ", "図書館"]);
  });

  it("formats a route estimate with a friendly distance and duration", () => {
    expect(formatWalkRouteEstimate("1.75", 34)).toBe("1.8 km・約34分");
  });

  it("returns a clear source label for each learning card", () => {
    expect(getLearningSourceLabel("book")).toBe("本から");
    expect(getLearningSourceLabel("school")).toBe("学校から");
  });
});
