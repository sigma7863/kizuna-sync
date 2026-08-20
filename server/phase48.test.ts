import { describe, expect, it } from "vitest";
import { countUnreadAppreciation, getDailyKey } from "../shared/familyConnectionFlow";

describe("familyConnectionFlow", () => {
  it("ローカル日付からゼロ埋め済みの日付キーを作る", () => {
    expect(getDailyKey(new Date(2026, 0, 9))).toBe("2026-01-09");
  });

  it("未読のお疲れさまカードだけを数える", () => {
    expect(countUnreadAppreciation([{ isSeen: false }, { isSeen: true }, { isSeen: false }])).toBe(2);
  });
});
