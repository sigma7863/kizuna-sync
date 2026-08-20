import { describe, expect, it } from "vitest";
import { countKeptTrials, getMondayKey } from "../shared/familyCareFlow";

describe("familyCareFlow", () => {
  it("週の途中の日付を、その週の月曜日キーに揃える", () => {
    expect(getMondayKey(new Date(2026, 7, 19))).toBe("2026-08-17");
  });

  it("日曜日も直前の月曜日キーに揃える", () => {
    expect(getMondayKey(new Date(2026, 7, 23))).toBe("2026-08-17");
  });

  it("残しておく試みだけを数える", () => {
    expect(countKeptTrials([{ isKept: true }, { isKept: false }, { isKept: true }])).toBe(2);
  });
});
