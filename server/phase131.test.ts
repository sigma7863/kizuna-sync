import { describe, expect, it } from "vitest";
import { normalizeThemeMode, resolveThemeMode } from "../shared/themeMode";

describe("phase 131 theme mode contract", () => {
  it("keeps an explicit light or dark preference", () => {
    expect(resolveThemeMode("light", true)).toBe("light");
    expect(resolveThemeMode("dark", false)).toBe("dark");
  });

  it("follows the system preference only in system mode", () => {
    expect(resolveThemeMode("system", true)).toBe("dark");
    expect(resolveThemeMode("system", false)).toBe("light");
  });

  it("accepts only supported persisted settings", () => {
    expect(normalizeThemeMode("dark")).toBe("dark");
    expect(normalizeThemeMode("unsupported")).toBe("system");
  });
});
