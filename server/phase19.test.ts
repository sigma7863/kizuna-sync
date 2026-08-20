import { describe, expect, it } from "vitest";
import { visibleFamilyContacts } from "../shared/familyContacts";
import { buildWeekendPlanPoll, normalizeWeekendPlanDraft } from "../shared/familyWeekendPlans";

describe("phase 19 contact and weekend coordination contracts", () => {
  it("limits child contact visibility to emergency cards while preserving guardian access", () => {
    const contacts = [{ id: 1, category: "緊急" }, { id: 2, category: "かかりつけ先" }, { id: 3, category: "避難場所" }];
    expect(visibleFamilyContacts(contacts, "child")).toEqual([{ id: 1, category: "緊急" }]);
    expect(visibleFamilyContacts(contacts, "guardian")).toHaveLength(3);
  });

  it("normalizes a persisted weekend plan and creates a clear family poll", () => {
    expect(normalizeWeekendPlanDraft({ title: "  公園ピクニック ", description: " 10時集合 ", activityType: "outdoor" })).toEqual({ title: "公園ピクニック", description: "10時集合", activityType: "outdoor" });
    const poll = buildWeekendPlanPoll("公園ピクニック");
    expect(poll.question).toContain("公園ピクニック");
    expect(poll.options).toEqual(["この案に賛成", "ほかの案も見たい"]);
    expect(poll.endsAt.getTime()).toBeGreaterThan(Date.now());
  });
});
