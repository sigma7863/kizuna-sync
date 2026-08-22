import { describe, expect, it } from "vitest";
import { buildCheckInContent, buildCheckInMetadata } from "../shared/checkin";
import { composeFamilyCheckInNote } from "../shared/familyCheckIn";

describe("phase 105 check-in preview and privacy contract", () => {
  it("builds the same selected state and optional note that the family will receive", () => {
    const preview = composeFamilyCheckInNote("available", "話せます", "今なら少し話せます");

    expect(preview).toBe("話せます — 今なら少し話せます");
    expect(buildCheckInContent(preview)).toBe(preview);
  });

  it("keeps the selected reassurance state in the structured timeline metadata", () => {
    expect(buildCheckInMetadata("rest")).toEqual({ isCheckIn: true, status: "rest" });
    expect(buildCheckInMetadata("available")).toEqual({ isCheckIn: true, status: "available" });
  });
});
