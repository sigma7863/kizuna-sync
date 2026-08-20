import { getFamilyTimeCapsuleByTaskUid, markFamilyTimeCapsuleOpened } from "./db";
import { createFamilyNotification } from "./notifications";

export function buildTimeCapsuleCron(opensAt: Date) {
  return `0 ${opensAt.getUTCMinutes()} ${opensAt.getUTCHours()} ${opensAt.getUTCDate()} ${opensAt.getUTCMonth() + 1} *`;
}

export async function releaseFamilyTimeCapsuleForTask(taskUid: string) {
  const capsule = await getFamilyTimeCapsuleByTaskUid(taskUid);
  if (!capsule) return { ok: true, skipped: "orphan" as const };
  if (capsule.openedAt) return { ok: true, skipped: "already-opened" as const };
  if (capsule.opensAt > new Date()) return { ok: true, skipped: "too-early" as const };

  await markFamilyTimeCapsuleOpened(capsule.id, new Date());
  await createFamilyNotification({
    familyGroupId: capsule.familyGroupId,
    type: "celebration",
    title: `タイムカプセル「${capsule.title}」が開きました`,
    message: capsule.message,
    payload: { timeCapsuleId: capsule.id, openedAt: new Date().toISOString() },
    quiet: false,
  });
  return { ok: true, capsuleId: capsule.id };
}
