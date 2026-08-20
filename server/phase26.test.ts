import { describe, expect, it } from "vitest";
import { formatVoiceDuration, getAchievementCategoryLabel, parseMorningItems } from "../shared/familyMorningRhythm";

describe("phase 26 family morning rhythm logic", () => {
  it("normalizes a compact morning carry list", () => {
    expect(parseMorningItems("水筒、 ハンカチ,水筒\n宿題", 4)).toEqual(["水筒", "ハンカチ", "宿題"]);
  });

  it("labels achievements for the monthly album", () => {
    expect(getAchievementCategoryLabel("help")).toBe("お手伝い");
    expect(getAchievementCategoryLabel("movement")).toBe("からだ");
  });

  it("formats short voice memo durations", () => {
    expect(formatVoiceDuration(67)).toBe("1:07");
  });
});
