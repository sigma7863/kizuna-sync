import { describe, expect, it } from "vitest";
import { MAX_ALBUM_PHOTO_BYTES, albumFileExtension, isSupportedAlbumMimeType } from "../shared/album";
import { speechLanguageFor } from "../client/src/lib/voiceConversation";

describe("phase 13 voice, album, and widget building blocks", () => {
  it("maps every supported application language to a Web Speech locale", () => {
    expect(speechLanguageFor("ja")).toBe("ja-JP");
    expect(speechLanguageFor("en")).toBe("en-US");
    expect(speechLanguageFor("zh")).toBe("zh-CN");
    expect(speechLanguageFor("ko")).toBe("ko-KR");
  });

  it("uses the shared album format and extension rules", () => {
    expect(isSupportedAlbumMimeType("image/jpeg")).toBe(true);
    expect(isSupportedAlbumMimeType("image/webp")).toBe(true);
    expect(isSupportedAlbumMimeType("image/gif")).toBe(false);
    expect(albumFileExtension("image/jpeg")).toBe("jpg");
    expect(albumFileExtension("image/png")).toBe("png");
    expect(albumFileExtension("image/webp")).toBe("webp");
    expect(MAX_ALBUM_PHOTO_BYTES).toBe(8 * 1024 * 1024);
  });

  it("keeps the compact widget state source contract explicit", () => {
    const status = {
      location: "自宅付近",
      health: "6,420歩",
      ripple: "花子さんがphotoを共有",
    };
    expect(Object.values(status)).toHaveLength(3);
    expect(status.ripple).toContain("共有");
  });
});
