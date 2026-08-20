import { describe, expect, it } from "vitest";
import { formatWordBatonContent, isUpcomingCelebration } from "../shared/familyCelebrations";

describe("phase 18 safety, celebrations, and word baton", () => {
  it("formats a positive word baton while trimming input", () => {
    expect(formatWordBatonContent("  家族で夕食を作れた  ")).toBe("今日のよかったこと：家族で夕食を作れた");
  });

  it("recognizes future celebration dates", () => {
    const now = new Date("2026-08-20T00:00:00.000Z");
    expect(isUpcomingCelebration(new Date("2026-08-20T00:00:00.000Z"), now)).toBe(true);
    expect(isUpcomingCelebration(new Date("2026-08-19T23:59:59.000Z"), now)).toBe(false);
  });
});
