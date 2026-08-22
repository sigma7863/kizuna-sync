import { describe, expect, it } from "vitest";
import { getDiscoveryCardMarkers, getDiscoveryResumeLabel, normalizeDiscoveryDensity } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 63", () => {
  it("カードごとの利用状態を見分ける目印を返す", () => {
    expect(getDiscoveryCardMarkers("a", ["a"], ["a"], ["b"])).toMatchObject({ isRecent: true, isFavorite: true, isNew: false, isUnvisited: false });
  });

  it("前回の絞り込み状態を短く表現する", () => {
    expect(getDiscoveryResumeLabel("予定", "recent", true)).toBe("予定・最近順・お気に入り");
  });

  it("許可された表示密度だけを保持する", () => {
    expect(normalizeDiscoveryDensity("compact")).toBe("compact");
    expect(normalizeDiscoveryDensity("wide")).toBe("comfortable");
  });
});
