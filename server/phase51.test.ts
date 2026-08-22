import { describe, expect, it } from "vitest";
import { countPendingPicks } from "../shared/familyEverydayPicks";

describe("familyEverydayPicks", () => {
  it("役立ち済み・確認済み・実行済み以外の項目だけを数える", () => {
    expect(countPendingPicks([{ isHelpful: false }, { isHelpful: true }, { isChecked: false }, { isChecked: true }, { isEnjoyed: false }])).toBe(3);
  });

  it("すべて処理済みの場合は0件を返す", () => {
    expect(countPendingPicks([{ isHelpful: true }, { isChecked: true }, { isEnjoyed: true }])).toBe(0);
  });
});
