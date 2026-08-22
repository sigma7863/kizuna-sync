import { describe, expect, it } from "vitest";
import { getFamilyFollowUpStorageKey, isFamilyFollowUpChoice } from "../shared/familyFollowUp";

describe("phase 126 private follow-up plan contracts", () => {
  it("uses a family-scoped local key and accepts only predefined private choices", () => {
    expect(getFamilyFollowUpStorageKey(42)).toBe("kizuna-sync-follow-up:42");
    expect(isFamilyFollowUpChoice("rest")).toBe(true);
    expect(isFamilyFollowUpChoice("share-with-everyone")).toBe(false);
  });
});
