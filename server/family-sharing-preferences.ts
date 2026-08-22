import { and, eq } from "drizzle-orm";
import { familySharingPreferences } from "../drizzle/schema";
import { defaultFamilySharingPreferences, normalizeFamilySharingPreferences, type FamilySharingPreferences } from "../shared/familySharing";
import { getDb } from "./db";

export type FamilySharingPreferenceRecord = FamilySharingPreferences & {
  familyGroupId: number;
  userId: number;
  updatedAt: Date;
};

export async function getFamilySharingPreference(familyGroupId: number, userId: number): Promise<FamilySharingPreferenceRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(familySharingPreferences).where(and(eq(familySharingPreferences.familyGroupId, familyGroupId), eq(familySharingPreferences.userId, userId))).limit(1);
  const row = rows[0];
  return row ? { familyGroupId: row.familyGroupId, userId: row.userId, ...normalizeFamilySharingPreferences(row), updatedAt: row.updatedAt } : undefined;
}

export async function listFamilySharingPreferences(familyGroupId: number): Promise<FamilySharingPreferenceRecord[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(familySharingPreferences).where(eq(familySharingPreferences.familyGroupId, familyGroupId));
  return rows.map((row) => ({ familyGroupId: row.familyGroupId, userId: row.userId, ...normalizeFamilySharingPreferences(row), updatedAt: row.updatedAt }));
}

export async function saveFamilySharingPreference(input: { familyGroupId: number; userId: number } & FamilySharingPreferences): Promise<FamilySharingPreferenceRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getFamilySharingPreference(input.familyGroupId, input.userId);
  if (existing) {
    await db.update(familySharingPreferences).set(normalizeFamilySharingPreferences(input)).where(eq(familySharingPreferences.id, (await db.select({ id: familySharingPreferences.id }).from(familySharingPreferences).where(and(eq(familySharingPreferences.familyGroupId, input.familyGroupId), eq(familySharingPreferences.userId, input.userId))).limit(1))[0]!.id));
  } else {
    await db.insert(familySharingPreferences).values({ ...input, ...normalizeFamilySharingPreferences(input) });
  }
  return (await getFamilySharingPreference(input.familyGroupId, input.userId)) ?? { familyGroupId: input.familyGroupId, userId: input.userId, ...normalizeFamilySharingPreferences(input), updatedAt: new Date() };
}
