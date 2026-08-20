export type PlaylistMood = "morning" | "homecoming" | "weekend" | "other";
export type RescueUrgency = "soon" | "urgent";

const moodLabels: Record<PlaylistMood, string> = { morning: "朝", homecoming: "帰宅", weekend: "週末", other: "いつでも" };
const urgencyLabels: Record<RescueUrgency, string> = { soon: "気づいたら", urgent: "急ぎ" };

export function getPlaylistMoodLabel(mood: PlaylistMood) { return moodLabels[mood]; }
export function getRescueUrgencyLabel(urgency: RescueUrgency) { return urgencyLabels[urgency]; }
export function groupThanksByDay(entries: Array<{ createdAt: Date }>) { return entries.reduce<Record<string, number>>((groups, entry) => { const key = entry.createdAt.toISOString().slice(0, 10); groups[key] = (groups[key] ?? 0) + 1; return groups; }, {}); }
