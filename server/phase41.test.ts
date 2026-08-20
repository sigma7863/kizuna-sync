import { describe, expect, it } from "vitest";
import { countOpenConversationMoments, tableTopicToneLabels } from "../shared/familyConversationMoments";

describe("phase 41 conversation and meeting support", () => {
  it("counts conversation moments that can be revisited later", () => {
    expect(countOpenConversationMoments([{ isFollowedUp: false }, { isFollowedUp: true }, { isDiscussed: false }])).toBe(2);
  });

  it("uses kind labels for meal-table conversation tones", () => {
    expect(tableTopicToneLabels.laugh).toBe("わらう");
    expect(tableTopicToneLabels.share).toBe("知る");
  });
});
