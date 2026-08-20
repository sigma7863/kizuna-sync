import { describe, expect, it } from "vitest";
import { countOpenQuestions, getNextWeekendDate } from "../shared/familyMorningWeekends";

describe("phase 38 morning and weekend family rhythm", () => {
  it("counts questions that can still become a family conversation", () => {
    expect(countOpenQuestions([{ isOpened: false }, { isOpened: true }, { isOpened: false }])).toBe(2);
  });

  it("finds the following Saturday as a gentle weekend planning default", () => {
    expect(getNextWeekendDate(new Date("2026-08-20T12:00:00")).toISOString()).toContain("2026-08-22");
  });
});
