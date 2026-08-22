import { describe, expect, it } from "vitest";
import { getDiscoveryReassurance, getUnvisitedCardSuggestions, normalizeDiscoveryPace } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 61", () => {
  it("未確認カードを指定した少数だけ提案する", () => {
    expect(getUnvisitedCardSuggestions(["card-priority-flow"], undefined, 1)).toHaveLength(1);
  });

  it("利用状況に応じた安心再開メッセージを返す", () => {
    expect(getDiscoveryReassurance([], [])).toContain("ゆっくり");
  });

  it("許可された探索ペースだけを保持する", () => {
    expect(normalizeDiscoveryPace(3)).toBe(3);
    expect(normalizeDiscoveryPace(5)).toBe(2);
  });
});
