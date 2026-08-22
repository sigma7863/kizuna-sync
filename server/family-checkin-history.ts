import { and, desc, eq } from "drizzle-orm";
import { familyCheckInRecords } from "../drizzle/schema";
import type { FamilyCheckInStatus } from "../shared/familyCheckIn";
import { getDb } from "./db";

export async function createFamilyCheckInRecord(input: { familyGroupId: number; userId: number; status: FamilyCheckInStatus; isShared: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familyCheckInRecords).values(input);
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, createdAt: new Date() };
}

export async function getOwnFamilyCheckInRecords(familyGroupId: number, userId: number, limit: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: familyCheckInRecords.id, status: familyCheckInRecords.status, createdAt: familyCheckInRecords.createdAt }).from(familyCheckInRecords).where(and(eq(familyCheckInRecords.familyGroupId, familyGroupId), eq(familyCheckInRecords.userId, userId))).orderBy(desc(familyCheckInRecords.createdAt)).limit(limit);
}

export async function getSharedFamilyCheckInRecords(familyGroupId: number, limit: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ userId: familyCheckInRecords.userId, status: familyCheckInRecords.status, createdAt: familyCheckInRecords.createdAt }).from(familyCheckInRecords).where(and(eq(familyCheckInRecords.familyGroupId, familyGroupId), eq(familyCheckInRecords.isShared, true))).orderBy(desc(familyCheckInRecords.createdAt)).limit(limit);
}
