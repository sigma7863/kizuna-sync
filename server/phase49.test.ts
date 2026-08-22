import { describe, expect, it } from "vitest";
import { countOpenItems } from "../shared/familyDailyBoard";

describe("familyDailyBoard", () => {
  it("完了・訪問・確認済み以外の項目だけを数える", () => {
    expect(countOpenItems([{ completed: false }, { completed: true }, { visited: false }, { acknowledged: true }, { acknowledged: false }])).toBe(3);
  });

  it("完了済みの項目しかない場合は0件を返す", () => {
    expect(countOpenItems([{ completed: true }, { visited: true }, { acknowledged: true }])).toBe(0);
  });
});
