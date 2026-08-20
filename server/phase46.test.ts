import { describe, expect, it } from "vitest";
import { countHelpfulHands, countSavedDiscoveries } from "../shared/familyGentleWeekend";

describe("phase 46 gentle weekend", () => {
  it("counts helpful small actions", () => {
    expect(countHelpfulHands([{ isHelpful: true }, { isHelpful: false }, { isHelpful: true }])).toBe(2);
  });

  it("counts discoveries the family wants to keep", () => {
    expect(countSavedDiscoveries([{ isSaved: false }, { isSaved: true }])).toBe(1);
  });
});
