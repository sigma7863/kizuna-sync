import { desc, eq } from "drizzle-orm";
import { familyFeatureLayouts } from "../drizzle/schema";
import { defaultFamilyFeatureLayout, normalizeFamilyFeatureLayout, type FamilyFeatureLayout } from "../shared/familyFeatureLayout";
import { getDb } from "./db";

export type FamilyFeatureLayoutRecord = FamilyFeatureLayout & {
  familyGroupId: number;
  updatedBy: number;
  updatedAt: Date;
};

function toRecord(row: typeof familyFeatureLayouts.$inferSelect): FamilyFeatureLayoutRecord {
  return {
    familyGroupId: row.familyGroupId,
    ...normalizeFamilyFeatureLayout({ order: row.featureOrder as never, hidden: row.hiddenFeatures as never }),
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt,
  };
}

export async function getFamilyFeatureLayout(familyGroupId: number): Promise<FamilyFeatureLayoutRecord | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const row = (await db.select().from(familyFeatureLayouts).where(eq(familyFeatureLayouts.familyGroupId, familyGroupId)).orderBy(desc(familyFeatureLayouts.updatedAt)).limit(1))[0];
  return row ? toRecord(row) : undefined;
}

export async function saveFamilyFeatureLayout(input: { familyGroupId: number; updatedBy: number } & FamilyFeatureLayout): Promise<FamilyFeatureLayoutRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const layout = normalizeFamilyFeatureLayout(input);
  const existing = await getFamilyFeatureLayout(input.familyGroupId);
  if (existing) {
    await db.update(familyFeatureLayouts).set({ featureOrder: layout.order, hiddenFeatures: layout.hidden, updatedBy: input.updatedBy }).where(eq(familyFeatureLayouts.familyGroupId, input.familyGroupId));
  } else {
    await db.insert(familyFeatureLayouts).values({ familyGroupId: input.familyGroupId, featureOrder: layout.order, hiddenFeatures: layout.hidden, updatedBy: input.updatedBy });
  }
  return (await getFamilyFeatureLayout(input.familyGroupId)) ?? { familyGroupId: input.familyGroupId, ...defaultFamilyFeatureLayout, updatedBy: input.updatedBy, updatedAt: new Date() };
}
