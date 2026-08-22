import { describe, expect, it } from "vitest";
import { getResumeCards, getRoleCardRecommendations, recordSearchHistory } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 59", () => {
  it("ロールごとに異なるおすすめカードを返す", () => {
    expect(getRoleCardRecommendations("guardian").map((card) => card.id)).not.toEqual(getRoleCardRecommendations("child").map((card) => card.id));
    expect(getRoleCardRecommendations("elderly")).toHaveLength(3);
  });

  it("最近使ったカードを優先して再開候補へまとめる", () => {
    expect(getResumeCards(["card-packing-checks"], ["card-packing-checks", "card-priority-flow"]).map((card) => card.id)).toEqual(["card-packing-checks", "card-priority-flow"]);
  });

  it("重複を除いた検索履歴を新しい順で保持する", () => {
    expect(recordSearchHistory(["予定", "持ち物"], "予定")).toEqual(["予定", "持ち物"]);
  });
});
