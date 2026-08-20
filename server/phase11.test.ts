import { describe, expect, it } from "vitest";
import { buildCelebrationMetadata, detectCelebrationOccasion, getCelebrationStamp } from "./celebration";

describe("phase 11 celebration stamps", () => {
  it("detects birthday language and creates a visual stamp payload", () => {
    expect(detectCelebrationOccasion("お誕生日おめでとう")) .toBe("birthday");
    expect(buildCelebrationMetadata("お誕生日おめでとう")).toMatchObject({
      isCelebration: true,
      occasion: "birthday",
      stamp: "🎂",
      tone: "pink",
    });
  });

  it("respects an explicitly selected occasion", () => {
    expect(detectCelebrationOccasion("ありがとう", "achievement")).toBe("achievement");
    expect(getCelebrationStamp("encouragement").emoji).toBe("🌟");
  });

  it("falls back to a general celebration stamp", () => {
    expect(buildCelebrationMetadata("家族に伝えたいこと").occasion).toBe("general");
    expect(buildCelebrationMetadata("家族に伝えたいこと").stamp).toBe("🎉");
  });
});
