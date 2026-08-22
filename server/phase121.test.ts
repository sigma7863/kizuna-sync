import { describe, expect, it } from "vitest";
import { MAIN_CONTENT_ID, shouldAnnounceRouteChange } from "../shared/a11yNavigation";

describe("phase 121 accessibility navigation contracts", () => {
  it("uses one stable skip-link target across pages", () => {
    expect(MAIN_CONTENT_ID).toBe("main-content");
  });

  it("does not announce the initial route but announces a real page change", () => {
    expect(shouldAnnounceRouteChange(null, "/")).toBe(false);
    expect(shouldAnnounceRouteChange("/", "/family/42")).toBe(true);
    expect(shouldAnnounceRouteChange("/family/42", "/family/42")).toBe(false);
  });
});
