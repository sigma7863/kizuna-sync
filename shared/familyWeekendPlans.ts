export type WeekendActivityType = "indoor" | "outdoor" | "hybrid";

export function normalizeWeekendPlanDraft(input: { title: string; description?: string; activityType: WeekendActivityType }) {
  return {
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    activityType: input.activityType,
  };
}

export function buildWeekendPlanPoll(title: string) {
  return {
    question: `イベント：週末は「${title}」にする？`,
    options: ["この案に賛成", "ほかの案も見たい"],
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  };
}
