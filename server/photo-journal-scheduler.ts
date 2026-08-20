import { generatePhotoJournalStory } from "./ai";
import {
  createPhotoJournal,
  getPhotoJournalScheduleByTaskUid,
  getRecentFamilyPhotoEntries,
  markPhotoJournalGenerated,
} from "./db";
import { createFamilyNotification } from "./notifications";

export function buildWeeklyCron(weekday: number, hour: number, minute: number) {
  return `0 ${minute} ${hour} * * ${weekday}`;
}

export async function generateWeeklyPhotoJournalForTask(taskUid: string) {
  const schedule = await getPhotoJournalScheduleByTaskUid(taskUid);
  if (!schedule || !schedule.enabled) return { ok: true, skipped: "disabled-orphan" as const };

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const photos = await getRecentFamilyPhotoEntries(schedule.familyGroupId, since);
  if (photos.length === 0) {
    await markPhotoJournalGenerated(schedule.id, new Date());
    return { ok: true, skipped: "no-photos" as const };
  }

  const description = photos
    .map((photo, index) => `${index + 1}. ${photo.content ?? "家族の写真"}`)
    .join("\n");
  const photoUrls = photos.map((photo) => photo.imageUrl).filter((url): url is string => Boolean(url));
  const story = await generatePhotoJournalStory("今週の家族の思い出", description, photos.length);
  const journal = await createPhotoJournal({
    familyGroupId: schedule.familyGroupId,
    title: "今週の家族の思い出",
    story,
    photoUrls,
  });
  await markPhotoJournalGenerated(schedule.id, new Date());
  await createFamilyNotification({
    familyGroupId: schedule.familyGroupId,
    type: "activity",
    title: "週次フォトジャーナルができました",
    message: "今週の写真から家族の物語をまとめました。",
    payload: { journalTitle: journal.title, photoCount: photos.length },
    quiet: true,
  });
  return { ok: true, journal, photoCount: photos.length };
}
