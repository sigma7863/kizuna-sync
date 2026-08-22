import { describe, expect, it } from "vitest";
import { countUnresolved } from "../shared/familyPriorityFlow";

describe("familyPriorityFlow", () => {
  it("未解決・未確認・未実施の項目だけを数える", () => {
    expect(countUnresolved([{ isResolved: false }, { isResolved: true }, { isConfirmed: false }, { isConfirmed: true }, { isTaken: false }])).toBe(3);
  });

  it("すべて処理済みの場合は0件を返す", () => {
    expect(countUnresolved([{ isResolved: true }, { isConfirmed: true }, { isTaken: true }])).toBe(0);
  });
});
