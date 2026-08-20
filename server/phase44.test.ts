import { describe, expect, it } from "vitest";
import { countSavedGoodFinds, getMonthKey, wellbeingStateLabels } from "../shared/familyEverydayGood";

describe("phase 44 everyday good", () => {
  it("makes a stable year-month key", () => {
    expect(getMonthKey(new Date("2026-08-20T12:00:00Z"))).toBe("2026-08");
  });

  it("counts saved good finds and labels non-clinical wellbeing states", () => {
    expect(countSavedGoodFinds([{ isSaved: true }, { isSaved: false }, { isSaved: true }])).toBe(2);
    expect(wellbeingStateLabels.need_space).toBe("静かにしたい");
  });
});
