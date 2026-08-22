import { describe, expect, it } from "vitest";
import { getFamilyAlbumDiscoveryMode } from "../shared/familyAlbumDiscovery";

describe("phase 116 accessible family album discovery", () => {
  it("prioritizes an entered search over the favorites filter", () => {
    expect(getFamilyAlbumDiscoveryMode("", false)).toBe("all");
    expect(getFamilyAlbumDiscoveryMode("", true)).toBe("favorites");
    expect(getFamilyAlbumDiscoveryMode("公園", true)).toBe("search");
  });
});
