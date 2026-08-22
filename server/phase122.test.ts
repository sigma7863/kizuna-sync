import { describe, expect, it } from "vitest";
import { formatFamilyDateTime, formatFamilyTime, getFamilyLocale } from "../shared/familyLocale";

describe("phase 122 localization contracts", () => {
  it("maps supported languages to explicit regional locales", () => {
    expect(getFamilyLocale("ja")).toBe("ja-JP");
    expect(getFamilyLocale("en")).toBe("en-US");
    expect(getFamilyLocale("zh")).toBe("zh-CN");
    expect(getFamilyLocale("ko")).toBe("ko-KR");
  });

  it("formats family dates and times with the requested locale", () => {
    const value = new Date("2026-08-22T03:04:00Z");
    expect(formatFamilyTime(value, "en")).toBe(new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(value));
    expect(formatFamilyDateTime(value, "ja")).toBe(new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeStyle: "short" }).format(value));
  });
});
