import { createFamilyDetailTabPath, getFamilyDetailTabPosition, getFamilyDetailTabRecentsStorageKey, getFamilyDetailTabStorageKey, getFamilyNavigationScrollBehavior, getInitialFamilyDetailTab, getMovedFamilyDetailTab, normalizeFamilyDetailTab, normalizeRecentFamilyDetailTabs, recordRecentFamilyDetailTab } from "../shared/familyDetailTabs";
import { describe, expect, it } from "vitest";

describe("family detail tab navigation phase 74", () => {
  it("共有URL用の有効なタブだけを受け入れる", () => {
    expect(normalizeFamilyDetailTab("album")).toBe("album");
    expect(normalizeFamilyDetailTab("unknown")).toBeUndefined();
  });

  it("共有URLを最後に開いたタブより優先して選ぶ", () => {
    expect(getInitialFamilyDetailTab("safety", "album")).toBe("safety");
    expect(getInitialFamilyDetailTab(null, "album")).toBe("album");
    expect(getInitialFamilyDetailTab("unknown", "invalid")).toBe("timeline");
  });

  it("家族IDとタブから共有可能な詳細URLを作る", () => {
    expect(createFamilyDetailTabPath(42, "assistant")).toBe("/family/42?tab=assistant");
  });

  it("再開するタブを家族ごとに別の保存キーへ分ける", () => {
    expect(getFamilyDetailTabStorageKey(42)).toBe("kizuna-sync-last-family-detail-tab:42");
    expect(getFamilyDetailTabStorageKey(43)).not.toBe(getFamilyDetailTabStorageKey(42));
  });

  it("キーボード操作で前後・先頭・末尾のタブへ移動する", () => {
    expect(getMovedFamilyDetailTab("timeline", "previous")).toBe("health");
    expect(getMovedFamilyDetailTab("timeline", "next")).toBe("safety");
    expect(getMovedFamilyDetailTab("assistant", "first")).toBe("timeline");
    expect(getMovedFamilyDetailTab("assistant", "last")).toBe("health");
  });

  it("動きを抑える設定では即時スクロールを選ぶ", () => {
    expect(getFamilyNavigationScrollBehavior(false)).toBe("smooth");
    expect(getFamilyNavigationScrollBehavior(true)).toBe("auto");
  });

  it("選択中タブの位置と総数を返す", () => {
    expect(getFamilyDetailTabPosition("timeline")).toEqual({ current: 1, total: 11 });
    expect(getFamilyDetailTabPosition("health")).toEqual({ current: 11, total: 11 });
  });

  it("最近使った機能を重複なく最大3件で記憶する", () => {
    expect(getFamilyDetailTabRecentsStorageKey(12)).toBe("kizuna-sync-family-detail-tab-recents-12");
    expect(normalizeRecentFamilyDetailTabs(["ai", "unknown", "album", "ai"])).toEqual(["ai", "album"]);
    expect(recordRecentFamilyDetailTab(["ai", "album", "stats"], "album")).toEqual(["album", "ai", "stats"]);
    expect(recordRecentFamilyDetailTab(["ai", "album", "stats"], "health")).toEqual(["health", "ai", "album"]);
  });
});
