import { describe, expect, it } from "vitest";
import { getCountdownText, getQuizAnswerLabel, isQuizAnswerCorrect } from "../shared/familyConversationGames";

describe("phase 29 family conversation logic", () => {
  it("shows a gentle countdown including today", () => {
    const now = new Date("2026-08-20T00:00:00Z");
    expect(getCountdownText(new Date("2026-08-23T00:00:00Z"), now)).toBe("あと3日");
    expect(getCountdownText(new Date("2026-08-20T12:00:00Z"), now)).toBe("今日");
  });
  it("checks a memory quiz answer", () => {
    expect(isQuizAnswerCorrect("b", "b")).toBe(true);
    expect(isQuizAnswerCorrect("a", "c")).toBe(false);
    expect(getQuizAnswerLabel("c")).toBe("C");
  });
});
