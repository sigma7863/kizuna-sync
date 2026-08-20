import { describe, expect, it } from "vitest";
import { isFamilyEventPoll, selectMemoryBookmark } from "../shared/familyMemories";

describe("phase 17 family coordination cards", () => {
  it("identifies only event coordination polls", () => {
    expect(isFamilyEventPoll("イベント：秋のピクニック")).toBe(true);
    expect(isFamilyEventPoll("今週末、何をしたい？")).toBe(false);
  });

  it("prefers gratitude when creating a daily memory bookmark", () => {
    const result = selectMemoryBookmark([
      { content: "おはよう" },
      { content: "ありがとう、助かったよ" },
    ]);
    expect(result?.content).toBe("ありがとう、助かったよ");
  });
});
