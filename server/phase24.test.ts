import { describe, expect, it } from "vitest";
import { getDailyMomentCaption, getMovementBingoProgress, getTakeHomeCategoryLabel } from "../shared/familyDailyRhythm";

describe("phase 24 family daily rhythm logic", () => {
  it("calculates a gentle movement bingo progress state", () => {
    expect(getMovementBingoProgress([{ isCompleted: true }, { isCompleted: false }, { isCompleted: true }])).toEqual({ completed: 2, total: 3, isBingo: false });
    expect(getMovementBingoProgress([{ isCompleted: true }, { isCompleted: true }, { isCompleted: true }]).isBingo).toBe(true);
  });

  it("labels a take-home note category for compact cards", () => {
    expect(getTakeHomeCategoryLabel("school")).toBe("学校");
    expect(getTakeHomeCategoryLabel("outing")).toBe("外出");
  });

  it("combines an optional mood sign with a daily moment note", () => {
    expect(getDailyMomentCaption("穏やか", "夕方の空がきれいだった")).toBe("穏やか · 夕方の空がきれいだった");
    expect(getDailyMomentCaption(null, "一緒にごはんを作った")).toBe("一緒にごはんを作った");
  });
});
