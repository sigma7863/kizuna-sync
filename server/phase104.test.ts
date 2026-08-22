import { describe, expect, it } from "vitest";
import { composeFamilyCheckInNote, familyCheckInStatuses } from "../shared/familyCheckIn";

describe("phase 104 family check-in shortcuts", () => {
  it("keeps the calm check-in states in a predictable order", () => {
    expect(familyCheckInStatuses).toEqual(["okay", "rest", "available"]);
  });

  it("adds the selected state before an optional personal note", () => {
    expect(composeFamilyCheckInNote("rest", "少し休みたいです", "あとで連絡します")).toBe("少し休みたいです — あとで連絡します");
    expect(composeFamilyCheckInNote("okay", "大丈夫です", "学校に着きました")).toBe("大丈夫です — 学校に着きました");
    expect(composeFamilyCheckInNote("okay", "大丈夫です", "  ")).toBe("大丈夫です");
  });
});
