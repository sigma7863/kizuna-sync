export type WeeklyPulseEntry = { createdAt: Date; metadata: unknown };
export type WeeklyPulsePhoto = { createdAt: Date };
export type WeeklyPulseHealth = { steps: number };

export function buildWeeklyPulse(input: {
  timeline: WeeklyPulseEntry[];
  albumPhotos: WeeklyPulsePhoto[];
  health: WeeklyPulseHealth[];
  now?: Date;
}) {
  const since = new Date(input.now ?? new Date());
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);
  const weeklyEntries = input.timeline.filter((entry) => new Date(entry.createdAt) >= since);
  const checkIns = weeklyEntries.filter((entry) => Boolean((entry.metadata as Record<string, unknown> | null)?.isCheckIn)).length;
  const photos = input.albumPhotos.filter((photo) => new Date(photo.createdAt) >= since).length;
  const totalSteps = input.health.reduce((sum, item) => sum + item.steps, 0);
  const score = Math.min(100, weeklyEntries.length * 7 + checkIns * 12 + photos * 10 + input.health.length * 5);
  return { score, posts: weeklyEntries.length, checkIns, photos, totalSteps, activeMembers: input.health.length };
}
