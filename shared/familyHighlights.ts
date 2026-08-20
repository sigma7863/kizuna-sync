export type HighlightEntry = { id: number; createdAt: Date; content: string | null };
export type HighlightLocation = { userId: number };
export type HighlightHealth = { userId: number; steps: number };

export function buildTodayKizunaHighlights(input: {
  timeline: HighlightEntry[];
  locations: HighlightLocation[];
  health: HighlightHealth[];
  now?: Date;
}) {
  const startOfToday = new Date(input.now ?? new Date());
  startOfToday.setHours(0, 0, 0, 0);
  return {
    entries: input.timeline.filter((entry) => new Date(entry.createdAt) >= startOfToday).slice(0, 6),
    activeMemberCount: new Set([...input.locations.map((item) => item.userId), ...input.health.map((item) => item.userId)]).size,
    locationCount: input.locations.length,
    totalSteps: input.health.reduce((sum, item) => sum + item.steps, 0),
  };
}
