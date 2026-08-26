import { and, eq } from "drizzle-orm";
import { familyThemePreferences } from "../drizzle/schema";
import type { ThemeMode } from "../shared/themeMode";
import { getDb } from "./db";

export type FamilyThemePreferenceRecord = {
  familyGroupId: number;
  userId: number;
  themeMode: ThemeMode;
  updatedAt: Date;
};

export async function getFamilyThemePreference(familyGroupId: number, userId: number): Promise<FamilyThemePreferenceRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const row = (await db.select().from(familyThemePreferences).where(and(eq(familyThemePreferences.familyGroupId, familyGroupId), eq(familyThemePreferences.userId, userId))).limit(1))[0];
  return row ? { familyGroupId: row.familyGroupId, userId: row.userId, themeMode: row.themeMode, updatedAt: row.updatedAt } : undefined;
}

export async function saveFamilyThemePreference(input: { familyGroupId: number; userId: number; themeMode: ThemeMode }): Promise<FamilyThemePreferenceRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getFamilyThemePreference(input.familyGroupId, input.userId);
  if (existing) {
    await db.update(familyThemePreferences).set({ themeMode: input.themeMode }).where(and(eq(familyThemePreferences.familyGroupId, input.familyGroupId), eq(familyThemePreferences.userId, input.userId)));
  } else {
    await db.insert(familyThemePreferences).values(input);
  }
  return (await getFamilyThemePreference(input.familyGroupId, input.userId)) ?? { ...input, updatedAt: new Date() };
}
