import { describe, expect, it } from "vitest";
import { getPlaylistMoodLabel, getRescueUrgencyLabel, groupThanksByDay } from "../shared/familyDailyCare";

describe("phase 28 family daily care logic", () => {
  it("labels shared playlist moments and rescue urgency", () => {
    expect(getPlaylistMoodLabel("homecoming")).toBe("帰宅");
    expect(getRescueUrgencyLabel("urgent")).toBe("急ぎ");
  });
  it("groups gratitude bookmarks by calendar day", () => {
    expect(groupThanksByDay([{ createdAt: new Date("2026-08-20T03:00:00Z") }, { createdAt: new Date("2026-08-20T15:00:00Z") }, { createdAt: new Date("2026-08-21T03:00:00Z") }])).toEqual({ "2026-08-20": 2, "2026-08-21": 1 });
  });
});
