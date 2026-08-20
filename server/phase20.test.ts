import { describe, expect, it } from "vitest";
import { filterBookshelfByTheme, getOutingChecklistProgress, parseFamilyStrengths } from "../shared/familyCollaboration";

describe("phase 20 family collaboration logic", () => {
  it("normalizes distinct strengths for the family role map", () => {
    expect(parseFamilyStrengths("料理、 聞き役,料理\n機械", 3)).toEqual(["料理", "聞き役", "機械"]);
  });

  it("filters bookshelf resources by an active theme", () => {
    const items = [{ id: 1, theme: "防災" }, { id: 2, theme: "科学" }];
    expect(filterBookshelfByTheme(items, "防災")).toEqual([{ id: 1, theme: "防災" }]);
    expect(filterBookshelfByTheme(items, "すべて")).toHaveLength(2);
  });

  it("reports collaborative outing checklist progress", () => {
    expect(getOutingChecklistProgress([{ isCompleted: true }, { isCompleted: false }])).toEqual({ completed: 1, total: 2, isReady: false });
    expect(getOutingChecklistProgress([{ isCompleted: true }]).isReady).toBe(true);
  });
});
