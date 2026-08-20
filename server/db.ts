import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  familyGroups,
  familyMembers,
  familyInvitations,
  timelineEntries,
  userActivities,
  locationHistory,
  geofences,
  geofenceAlertStates,
  photoJournalSchedules,
  wearableHealthSnapshots,
  photoJournals,
  familyAlbumPhotos,
  familyHelpRequests,
  familyShoppingItems,
  familyTimeCapsules,
  familyPolls,
  familyPollResponses,
  familySafetyChecklistItems,
  familyCelebrationDates,
  familyContactCards,
  familyGentleRules,
  familyWeekendPlans,
  familyRoleProfiles,
  familyBookshelfItems,
  familyOutings,
  familyOutingChecklistItems,
  familyMealIdeas,
  familyCareDuties,
  familyFunPrompts,
  familyCareMessages,
  familySharedItems,
  familyMonthlyChallenges,
  familyWalkRoutes,
  familyLearningCards,
  familyDailyMoments,
  familyMovementBingoCells,
  familyTakeHomeNotes,
  familyEncouragementPosts,
  familyEnergyStatuses,
  familyWishListItems,
  familyMorningPlans,
  familyVoiceMemos,
  familyAchievementEntries,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { matchesAlbumSearch } from "../shared/album";
import { summarizeFamilyPoll } from "../shared/familyPolls";


let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Family group queries
export async function createFamilyGroup(name: string, createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familyGroups).values({ name, createdBy });
  return result;
}

export async function getFamilyGroupById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(familyGroups).where(eq(familyGroups.id, id)).limit(1);
  return result[0];
}

export async function getUserFamilyGroups(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(familyGroups)
    .innerJoin(familyMembers, eq(familyMembers.familyGroupId, familyGroups.id))
    .where(eq(familyMembers.userId, userId));
  return result.map(r => r.family_groups);
}

// Family member queries
export async function addFamilyMember(familyGroupId: number, userId: number, memberRole: 'guardian' | 'child' | 'elderly') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(familyMembers).values({ familyGroupId, userId, memberRole });
}

export async function getFamilyMembers(familyGroupId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(familyMembers)
    .innerJoin(users, eq(familyMembers.userId, users.id))
    .where(eq(familyMembers.familyGroupId, familyGroupId));
  return result;
}

// Timeline queries
export async function createTimelineEntry(
  familyGroupId: number,
  userId: number,
  entryType: 'mood' | 'photo' | 'message' | 'location' | 'activity',
  content?: string,
  imageUrl?: string,
  metadata?: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(timelineEntries).values({
    familyGroupId,
    userId,
    entryType,
    content,
    imageUrl,
    metadata,
  });
}

export async function getFamilyTimeline(familyGroupId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(timelineEntries)
    .where(eq(timelineEntries.familyGroupId, familyGroupId))
    .orderBy(desc(timelineEntries.createdAt))
    .limit(limit);
  return result;
}

export async function getFamilyDigestAlbumEntries(familyGroupId: number, yearMonth: string) {
  const db = await getDb();
  if (!db) return [];
  const entries = await db
    .select()
    .from(timelineEntries)
    .where(eq(timelineEntries.familyGroupId, familyGroupId))
    .orderBy(desc(timelineEntries.createdAt))
    .limit(2000);

  return entries.filter((entry) => {
    const meta = entry.metadata as any;
    const isCelebration = meta?.isCelebration === true || meta?.occasion !== undefined;
    if (!isCelebration) return false;
    const d = new Date(entry.createdAt);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return ym === yearMonth;
  });
}

export async function getFamilyDigestAvailableMonths(familyGroupId: number) {
  const db = await getDb();
  if (!db) return [];
  const entries = await db
    .select()
    .from(timelineEntries)
    .where(eq(timelineEntries.familyGroupId, familyGroupId))
    .orderBy(desc(timelineEntries.createdAt))
    .limit(2000);

  const monthsSet = new Set<string>();
  entries.forEach((entry) => {
    const meta = entry.metadata as any;
    const isCelebration = meta?.isCelebration === true || meta?.occasion !== undefined;
    if (isCelebration) {
      const d = new Date(entry.createdAt);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthsSet.add(ym);
    }
  });
  return Array.from(monthsSet).sort().reverse();
}

// Family cloud album queries. Image binaries are kept in S3; this table only
// contains searchable metadata and favorite state.
export async function createFamilyAlbumPhoto(input: {
  familyGroupId: number;
  userId: number;
  fileKey: string;
  imageUrl: string;
  fileName: string;
  mimeType: string;
  description?: string;
  tags?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familyAlbumPhotos).values({
    familyGroupId: input.familyGroupId,
    userId: input.userId,
    fileKey: input.fileKey,
    imageUrl: input.imageUrl,
    fileName: input.fileName,
    mimeType: input.mimeType,
    description: input.description ?? null,
    tags: input.tags ?? [],
  });
  return result;
}

export async function getFamilyAlbumPhotos(familyGroupId: number, favoritesOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const condition = favoritesOnly
    ? and(eq(familyAlbumPhotos.familyGroupId, familyGroupId), eq(familyAlbumPhotos.isFavorite, true))
    : eq(familyAlbumPhotos.familyGroupId, familyGroupId);
  return db.select().from(familyAlbumPhotos).where(condition).orderBy(desc(familyAlbumPhotos.createdAt));
}

export async function searchFamilyAlbumPhotos(familyGroupId: number, keyword: string) {
  const photos = await getFamilyAlbumPhotos(familyGroupId);
  return photos.filter((photo) => matchesAlbumSearch(photo, keyword));
}

export async function setFamilyAlbumPhotoFavorite(input: { photoId: number; familyGroupId: number; isFavorite: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(familyAlbumPhotos)
    .set({ isFavorite: input.isFavorite })
    .where(and(eq(familyAlbumPhotos.id, input.photoId), eq(familyAlbumPhotos.familyGroupId, input.familyGroupId)));
}

export async function createFamilyHelpRequest(input: {
  familyGroupId: number;
  requesterUserId: number;
  title: string;
  detail?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familyHelpRequests).values({ ...input, detail: input.detail ?? null });
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, status: "open" as const };
}

export async function getFamilyHelpRequests(familyGroupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(familyHelpRequests)
    .where(eq(familyHelpRequests.familyGroupId, familyGroupId))
    .orderBy(desc(familyHelpRequests.updatedAt));
}

export async function acceptFamilyHelpRequest(input: { familyGroupId: number; requestId: number; helperUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(familyHelpRequests)
    .set({ helperUserId: input.helperUserId, status: "accepted" })
    .where(and(
      eq(familyHelpRequests.id, input.requestId),
      eq(familyHelpRequests.familyGroupId, input.familyGroupId),
      eq(familyHelpRequests.status, "open"),
    ));
}

export async function completeFamilyHelpRequest(input: { familyGroupId: number; requestId: number; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(familyHelpRequests)
    .set({ status: "completed" })
    .where(and(
      eq(familyHelpRequests.id, input.requestId),
      eq(familyHelpRequests.familyGroupId, input.familyGroupId),
      eq(familyHelpRequests.helperUserId, input.userId),
      eq(familyHelpRequests.status, "accepted"),
    ));
}

export async function createFamilyShoppingItem(input: { familyGroupId: number; createdByUserId: number; itemName: string; quantity?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familyShoppingItems).values({ ...input, quantity: input.quantity ?? null });
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, isPurchased: false };
}

export async function getFamilyShoppingItems(familyGroupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(familyShoppingItems)
    .where(eq(familyShoppingItems.familyGroupId, familyGroupId))
    .orderBy(familyShoppingItems.isPurchased, desc(familyShoppingItems.updatedAt));
}

export async function toggleFamilyShoppingItem(input: { familyGroupId: number; itemId: number; isPurchased: boolean; userId: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(familyShoppingItems)
    .set({ isPurchased: input.isPurchased, purchasedByUserId: input.isPurchased ? input.userId : null })
    .where(and(eq(familyShoppingItems.id, input.itemId), eq(familyShoppingItems.familyGroupId, input.familyGroupId)));
}

export async function createFamilyTimeCapsule(input: { familyGroupId: number; creatorUserId: number; title: string; message: string; opensAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familyTimeCapsules).values(input);
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input };
}

export async function getFamilyTimeCapsules(familyGroupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(familyTimeCapsules)
    .where(eq(familyTimeCapsules.familyGroupId, familyGroupId))
    .orderBy(desc(familyTimeCapsules.opensAt));
}

export async function setFamilyTimeCapsuleTaskUid(id: number, taskUid: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(familyTimeCapsules).set({ scheduleCronTaskUid: taskUid }).where(eq(familyTimeCapsules.id, id));
}

export async function getFamilyTimeCapsuleByTaskUid(taskUid: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(familyTimeCapsules).where(eq(familyTimeCapsules.scheduleCronTaskUid, taskUid)).limit(1);
  return rows[0];
}

export async function markFamilyTimeCapsuleOpened(id: number, openedAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(familyTimeCapsules).set({ openedAt }).where(and(eq(familyTimeCapsules.id, id), isNull(familyTimeCapsules.openedAt)));
}

export async function createFamilyPoll(input: { familyGroupId: number; creatorUserId: number; question: string; options: string[]; endsAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familyPolls).values(input);
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input };
}

export async function getFamilyPollsWithResults(familyGroupId: number, currentUserId: number) {
  const db = await getDb();
  if (!db) return [];
  const polls = await db.select().from(familyPolls).where(eq(familyPolls.familyGroupId, familyGroupId)).orderBy(desc(familyPolls.createdAt));
  const responses = await db.select().from(familyPollResponses);
  return polls.map((poll) => {
    const pollResponses = responses.filter((response) => response.pollId === poll.id);
    const options = Array.isArray(poll.options) ? poll.options.filter((option): option is string => typeof option === "string") : [];
    return { ...poll, options, ...summarizeFamilyPoll(options, pollResponses, currentUserId) };
  });
}

export async function answerFamilyPoll(input: { pollId: number; userId: number; optionIndex: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(familyPollResponses)
    .where(and(eq(familyPollResponses.pollId, input.pollId), eq(familyPollResponses.respondentUserId, input.userId)))
    .limit(1);
  if (existing[0]) return { alreadyAnswered: true as const };
  const result = await db.insert(familyPollResponses).values({ pollId: input.pollId, respondentUserId: input.userId, optionIndex: input.optionIndex });
  return { alreadyAnswered: false as const, id: Number((result as { insertId?: number }).insertId ?? 0) };
}

export async function createFamilySafetyChecklistItem(input: { familyGroupId: number; createdByUserId: number; label: string; category: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familySafetyChecklistItems).values(input);
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, isCompleted: false };
}

export async function getFamilySafetyChecklistItems(familyGroupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(familySafetyChecklistItems).where(eq(familySafetyChecklistItems.familyGroupId, familyGroupId)).orderBy(familySafetyChecklistItems.isCompleted, desc(familySafetyChecklistItems.updatedAt));
}

export async function toggleFamilySafetyChecklistItem(input: { familyGroupId: number; itemId: number; isCompleted: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(familySafetyChecklistItems).set({ isCompleted: input.isCompleted }).where(and(eq(familySafetyChecklistItems.id, input.itemId), eq(familySafetyChecklistItems.familyGroupId, input.familyGroupId)));
}

export async function createFamilyCelebrationDate(input: { familyGroupId: number; createdByUserId: number; title: string; celebrationAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(familyCelebrationDates).values(input);
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input };
}

export async function getFamilyCelebrationDates(familyGroupId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(familyCelebrationDates).where(eq(familyCelebrationDates.familyGroupId, familyGroupId)).orderBy(familyCelebrationDates.celebrationAt);
}

export async function createFamilyContactCard(input: { familyGroupId: number; createdByUserId: number; label: string; phone: string; category: string }) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const result = await db.insert(familyContactCards).values(input);
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input };
}
export async function getFamilyContactCards(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyContactCards).where(eq(familyContactCards.familyGroupId, familyGroupId)) : []; }
export async function createFamilyGentleRule(input: { familyGroupId: number; createdByUserId: number; title: string; detail?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyGentleRules).values({ ...input, detail: input.detail ?? null }); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, isAgreed: false }; }
export async function getFamilyGentleRules(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyGentleRules).where(eq(familyGentleRules.familyGroupId, familyGroupId)) : []; }
export async function toggleFamilyGentleRule(input: { familyGroupId: number; ruleId: number; isAgreed: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyGentleRules).set({ isAgreed: input.isAgreed }).where(and(eq(familyGentleRules.id, input.ruleId), eq(familyGentleRules.familyGroupId, input.familyGroupId))); }
export async function createFamilyWeekendPlan(input: { familyGroupId: number; createdByUserId: number; title: string; description?: string; activityType: "indoor" | "outdoor" | "hybrid" }) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const result = await db.insert(familyWeekendPlans).values({ ...input, description: input.description ?? null });
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, description: input.description ?? null, sharedPollId: null };
}
export async function getFamilyWeekendPlans(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyWeekendPlans).where(eq(familyWeekendPlans.familyGroupId, familyGroupId)).orderBy(desc(familyWeekendPlans.createdAt)) : []; }
export async function getFamilyWeekendPlan(familyGroupId: number, planId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(familyWeekendPlans).where(and(eq(familyWeekendPlans.familyGroupId, familyGroupId), eq(familyWeekendPlans.id, planId))).limit(1); return rows[0]; }
export async function setFamilyWeekendPlanShared(input: { familyGroupId: number; planId: number; sharedPollId: number }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyWeekendPlans).set({ sharedPollId: input.sharedPollId }).where(and(eq(familyWeekendPlans.id, input.planId), eq(familyWeekendPlans.familyGroupId, input.familyGroupId))); }
export async function getFamilyRoleProfiles(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyRoleProfiles).where(eq(familyRoleProfiles.familyGroupId, familyGroupId)) : []; }
export async function upsertFamilyRoleProfile(input: { familyGroupId: number; userId: number; strengths: string[]; supportNote?: string }) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const existing = await db.select().from(familyRoleProfiles).where(and(eq(familyRoleProfiles.familyGroupId, input.familyGroupId), eq(familyRoleProfiles.userId, input.userId))).limit(1);
  const values = { strengths: input.strengths, supportNote: input.supportNote ?? null };
  if (existing[0]) { await db.update(familyRoleProfiles).set(values).where(eq(familyRoleProfiles.id, existing[0].id)); return { ...existing[0], ...values }; }
  const result = await db.insert(familyRoleProfiles).values({ familyGroupId: input.familyGroupId, userId: input.userId, ...values });
  return { id: Number((result as { insertId?: number }).insertId ?? 0), familyGroupId: input.familyGroupId, userId: input.userId, ...values };
}
export async function createFamilyBookshelfItem(input: { familyGroupId: number; createdByUserId: number; title: string; resourceType: "book" | "video" | "article"; theme: string; resourceUrl?: string; note?: string }) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const values = { ...input, resourceUrl: input.resourceUrl ?? null, note: input.note ?? null };
  const result = await db.insert(familyBookshelfItems).values(values);
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values };
}
export async function getFamilyBookshelfItems(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyBookshelfItems).where(eq(familyBookshelfItems.familyGroupId, familyGroupId)).orderBy(desc(familyBookshelfItems.createdAt)) : []; }
export async function createFamilyOuting(input: { familyGroupId: number; createdByUserId: number; title: string; meetingAt: Date; meetingPlace?: string; notes?: string }) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const values = { ...input, meetingPlace: input.meetingPlace ?? null, notes: input.notes ?? null };
  const result = await db.insert(familyOutings).values(values);
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values };
}
export async function getFamilyOutingsWithChecklist(familyGroupId: number) { const db = await getDb(); if (!db) return []; const outings = await db.select().from(familyOutings).where(eq(familyOutings.familyGroupId, familyGroupId)).orderBy(familyOutings.meetingAt); const items = await db.select().from(familyOutingChecklistItems); return outings.map((outing) => ({ ...outing, checklist: items.filter((item) => item.outingId === outing.id) })); }
export async function createFamilyOutingChecklistItem(input: { outingId: number; createdByUserId: number; label: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyOutingChecklistItems).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, isCompleted: false }; }
export async function toggleFamilyOutingChecklistItem(input: { outingId: number; itemId: number; isCompleted: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyOutingChecklistItems).set({ isCompleted: input.isCompleted }).where(and(eq(familyOutingChecklistItems.id, input.itemId), eq(familyOutingChecklistItems.outingId, input.outingId))); }
export async function createFamilyMealIdea(input: { familyGroupId: number; createdByUserId: number; title: string; ideaType: "want" | "can_make"; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyMealIdeas).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isSelected: false }; }
export async function getFamilyMealIdeas(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyMealIdeas).where(eq(familyMealIdeas.familyGroupId, familyGroupId)).orderBy(desc(familyMealIdeas.createdAt)) : []; }
export async function selectFamilyMealIdea(input: { familyGroupId: number; mealIdeaId: number }) { const db = await getDb(); if (!db) throw new Error("Database not available"); await db.update(familyMealIdeas).set({ isSelected: false }).where(eq(familyMealIdeas.familyGroupId, input.familyGroupId)); return db.update(familyMealIdeas).set({ isSelected: true }).where(and(eq(familyMealIdeas.id, input.mealIdeaId), eq(familyMealIdeas.familyGroupId, input.familyGroupId))); }
export async function createFamilyCareDuty(input: { familyGroupId: number; createdByUserId: number; assignedUserId?: number; careTarget: string; title: string; dueOn?: Date }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, assignedUserId: input.assignedUserId ?? null, dueOn: input.dueOn ?? null }; const result = await db.insert(familyCareDuties).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, status: "open" as const, completedAt: null }; }
export async function getFamilyCareDuties(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyCareDuties).where(eq(familyCareDuties.familyGroupId, familyGroupId)).orderBy(desc(familyCareDuties.createdAt)) : []; }
export async function completeFamilyCareDuty(input: { familyGroupId: number; dutyId: number; isDone: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyCareDuties).set({ status: input.isDone ? "done" : "open", completedAt: input.isDone ? new Date() : null }).where(and(eq(familyCareDuties.id, input.dutyId), eq(familyCareDuties.familyGroupId, input.familyGroupId))); }
export async function createFamilyFunPrompt(input: { familyGroupId: number; createdByUserId: number; content: string; theme: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyFunPrompts).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyFunPrompts(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyFunPrompts).where(eq(familyFunPrompts.familyGroupId, familyGroupId)).orderBy(desc(familyFunPrompts.createdAt)) : []; }
export async function createFamilyCareMessage(input: { familyGroupId: number; senderUserId: number; recipientUserId?: number; message: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, recipientUserId: input.recipientUserId ?? null }; const result = await db.insert(familyCareMessages).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isRead: false, readAt: null }; }
export async function getFamilyCareMessages(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyCareMessages).where(eq(familyCareMessages.familyGroupId, familyGroupId)).orderBy(desc(familyCareMessages.createdAt)) : []; }
export async function markFamilyCareMessageRead(input: { familyGroupId: number; messageId: number }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyCareMessages).set({ isRead: true, readAt: new Date() }).where(and(eq(familyCareMessages.id, input.messageId), eq(familyCareMessages.familyGroupId, input.familyGroupId))); }
export async function createFamilySharedItem(input: { familyGroupId: number; ownerUserId: number; borrowerUserId?: number; itemName: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, borrowerUserId: input.borrowerUserId ?? null, note: input.note ?? null }; const result = await db.insert(familySharedItems).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, status: "available" as const }; }
export async function getFamilySharedItems(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familySharedItems).where(eq(familySharedItems.familyGroupId, familyGroupId)).orderBy(desc(familySharedItems.updatedAt)) : []; }
export async function updateFamilySharedItemStatus(input: { familyGroupId: number; itemId: number; borrowerUserId?: number; status: "available" | "borrowed" | "returned" }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familySharedItems).set({ status: input.status, borrowerUserId: input.status === "borrowed" ? input.borrowerUserId ?? null : null }).where(and(eq(familySharedItems.id, input.itemId), eq(familySharedItems.familyGroupId, input.familyGroupId))); }
export async function createFamilyMonthlyChallenge(input: { familyGroupId: number; createdByUserId: number; title: string; description?: string; targetCount: number; celebrationNote?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, description: input.description ?? null, celebrationNote: input.celebrationNote ?? null }; const result = await db.insert(familyMonthlyChallenges).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, progressCount: 0, isCompleted: false }; }
export async function getFamilyMonthlyChallenges(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyMonthlyChallenges).where(eq(familyMonthlyChallenges.familyGroupId, familyGroupId)).orderBy(desc(familyMonthlyChallenges.updatedAt)) : []; }

export async function createFamilyWalkRoute(input: { familyGroupId: number; createdByUserId: number; title: string; description?: string; startPoint: string; highlights?: string; distanceKm: number; durationMin: number; safetyNote?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, distanceKm: input.distanceKm.toFixed(2), description: input.description ?? null, highlights: input.highlights ?? null, safetyNote: input.safetyNote ?? null }; const result = await db.insert(familyWalkRoutes).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyWalkRoutes(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyWalkRoutes).where(eq(familyWalkRoutes.familyGroupId, familyGroupId)).orderBy(desc(familyWalkRoutes.createdAt)) : []; }

export async function createFamilyLearningCard(input: { familyGroupId: number; createdByUserId: number; title: string; source?: string; sourceType: "book" | "school" | "work" | "other"; insight: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, source: input.source ?? null }; const result = await db.insert(familyLearningCards).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyLearningCards(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyLearningCards).where(eq(familyLearningCards.familyGroupId, familyGroupId)).orderBy(desc(familyLearningCards.createdAt)) : []; }

export async function createFamilyDailyMoment(input: { familyGroupId: number; createdByUserId: number; photoId?: number; moodSign?: string; note: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, photoId: input.photoId ?? null, moodSign: input.moodSign ?? null }; const result = await db.insert(familyDailyMoments).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyDailyMoments(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyDailyMoments).where(eq(familyDailyMoments.familyGroupId, familyGroupId)).orderBy(desc(familyDailyMoments.createdAt)).limit(20) : []; }

export async function createFamilyMovementBingoCell(input: { familyGroupId: number; createdByUserId: number; label: string; icon?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, icon: input.icon ?? null }; const result = await db.insert(familyMovementBingoCells).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isCompleted: false, completedAt: null }; }
export async function getFamilyMovementBingoCells(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyMovementBingoCells).where(eq(familyMovementBingoCells.familyGroupId, familyGroupId)).orderBy(desc(familyMovementBingoCells.createdAt)).limit(9) : []; }
export async function toggleFamilyMovementBingoCell(input: { familyGroupId: number; cellId: number; isCompleted: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyMovementBingoCells).set({ isCompleted: input.isCompleted, completedAt: input.isCompleted ? new Date() : null }).where(and(eq(familyMovementBingoCells.id, input.cellId), eq(familyMovementBingoCells.familyGroupId, input.familyGroupId))); }

export async function createFamilyTakeHomeNote(input: { familyGroupId: number; createdByUserId: number; category: "school" | "work" | "outing" | "other"; title: string; content: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyTakeHomeNotes).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, isResolved: false }; }
export async function getFamilyTakeHomeNotes(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyTakeHomeNotes).where(eq(familyTakeHomeNotes.familyGroupId, familyGroupId)).orderBy(desc(familyTakeHomeNotes.updatedAt)) : []; }
export async function toggleFamilyTakeHomeNote(input: { familyGroupId: number; noteId: number; isResolved: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyTakeHomeNotes).set({ isResolved: input.isResolved }).where(and(eq(familyTakeHomeNotes.id, input.noteId), eq(familyTakeHomeNotes.familyGroupId, input.familyGroupId))); }

export async function createFamilyEncouragementPost(input: { familyGroupId: number; senderUserId: number; recipientUserId?: number; message: string; stamp?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, recipientUserId: input.recipientUserId ?? null, stamp: input.stamp ?? null }; const result = await db.insert(familyEncouragementPosts).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyEncouragementPosts(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyEncouragementPosts).where(eq(familyEncouragementPosts.familyGroupId, familyGroupId)).orderBy(desc(familyEncouragementPosts.createdAt)).limit(24) : []; }

export async function createFamilyEnergyStatus(input: { familyGroupId: number; userId: number; energyLevel: number; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyEnergyStatuses).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyEnergyStatuses(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyEnergyStatuses).where(eq(familyEnergyStatuses.familyGroupId, familyGroupId)).orderBy(desc(familyEnergyStatuses.createdAt)).limit(24) : []; }

export async function createFamilyWishListItem(input: { familyGroupId: number; createdByUserId: number; title: string; category: "place" | "activity" | "challenge" | "other"; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyWishListItems).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, status: "wish" as const }; }
export async function getFamilyWishListItems(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyWishListItems).where(eq(familyWishListItems.familyGroupId, familyGroupId)).orderBy(desc(familyWishListItems.updatedAt)) : []; }
export async function updateFamilyWishListStatus(input: { familyGroupId: number; itemId: number; status: "wish" | "candidate" | "done" }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyWishListItems).set({ status: input.status }).where(and(eq(familyWishListItems.id, input.itemId), eq(familyWishListItems.familyGroupId, input.familyGroupId))); }

export async function createFamilyMorningPlan(input: { familyGroupId: number; userId: number; departureTime?: string; moodSign?: string; carryingItems?: string; isReady: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, departureTime: input.departureTime ?? null, moodSign: input.moodSign ?? null, carryingItems: input.carryingItems ?? null }; const result = await db.insert(familyMorningPlans).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyMorningPlans(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyMorningPlans).where(eq(familyMorningPlans.familyGroupId, familyGroupId)).orderBy(desc(familyMorningPlans.createdAt)).limit(30) : []; }

export async function createFamilyVoiceMemo(input: { familyGroupId: number; userId: number; fileKey: string; audioUrl: string; mimeType: string; durationSeconds: number; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyVoiceMemos).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyVoiceMemos(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyVoiceMemos).where(eq(familyVoiceMemos.familyGroupId, familyGroupId)).orderBy(desc(familyVoiceMemos.createdAt)).limit(24) : []; }

export async function createFamilyAchievementEntry(input: { familyGroupId: number; userId: number; title: string; category: "help" | "movement" | "challenge" | "other"; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyAchievementEntries).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyAchievementEntries(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyAchievementEntries).where(eq(familyAchievementEntries.familyGroupId, familyGroupId)).orderBy(desc(familyAchievementEntries.createdAt)).limit(36) : []; }
export async function advanceFamilyMonthlyChallenge(input: { familyGroupId: number; challengeId: number; delta: number }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const [current] = await db.select().from(familyMonthlyChallenges).where(and(eq(familyMonthlyChallenges.id, input.challengeId), eq(familyMonthlyChallenges.familyGroupId, input.familyGroupId))).limit(1); if (!current) throw new Error("Challenge not found"); const nextProgress = Math.max(0, current.progressCount + input.delta); return db.update(familyMonthlyChallenges).set({ progressCount: nextProgress, isCompleted: nextProgress >= current.targetCount }).where(and(eq(familyMonthlyChallenges.id, input.challengeId), eq(familyMonthlyChallenges.familyGroupId, input.familyGroupId))); }

// Activity queries
export async function logUserActivity(
  userId: number,
  familyGroupId: number,
  activityType: 'walking' | 'photo' | 'music' | 'location' | 'mood' | 'message',
  activityData?: any,
  latitude?: number,
  longitude?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(userActivities).values({
    userId,
    familyGroupId,
    activityType,
    activityData,
    latitude: latitude ? latitude.toString() : undefined,
    longitude: longitude ? longitude.toString() : undefined,
  });
}

// Location queries
export async function saveLocationHistory(
  userId: number,
  familyGroupId: number,
  latitude: number,
  longitude: number,
  accuracy?: number,
  locationName?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(locationHistory).values({
    userId,
    familyGroupId,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    accuracy,
    locationName,
  });
}

export async function getLatestUserLocation(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(locationHistory)
    .where(eq(locationHistory.userId, userId))
    .orderBy(desc(locationHistory.createdAt))
    .limit(1);
  return result[0];
}

// Invitation queries
export async function createInvitation(
  familyGroupId: number,
  invitationCode: string,
  suggestedRole: 'guardian' | 'child' | 'elderly',
  invitedEmail?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return await db.insert(familyInvitations).values({
    familyGroupId,
    invitationCode,
    suggestedRole,
    invitedEmail,
    expiresAt,
  });
}

export async function getInvitationByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(familyInvitations)
    .where(eq(familyInvitations.invitationCode, code))
    .limit(1);
  return result[0];
}

// Geofence queries
export async function createGeofence(
  familyGroupId: number,
  name: string,
  latitude: number,
  longitude: number,
  radiusMeters: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(geofences).values({
    familyGroupId,
    name,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radiusMeters,
  });
}

export async function getFamilyGeofences(familyGroupId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(geofences).where(eq(geofences.familyGroupId, familyGroupId));
}


export async function getFamilyLatestLocations(familyGroupId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ location: locationHistory, user: users })
    .from(locationHistory)
    .innerJoin(users, eq(locationHistory.userId, users.id))
    .where(eq(locationHistory.familyGroupId, familyGroupId))
    .orderBy(desc(locationHistory.createdAt))
    .limit(limit);
  const latestByUser = new Map<number, (typeof rows)[number]>();
  for (const row of rows) {
    if (!latestByUser.has(row.location.userId)) latestByUser.set(row.location.userId, row);
  }
  return Array.from(latestByUser.values()).map(({ location, user }) => ({
    userId: location.userId,
    userName: user.name ?? "Family member",
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    accuracy: location.accuracy ?? undefined,
    locationName: location.locationName ?? undefined,
    timestamp: location.createdAt,
  }));
}

export async function getFamilyLocationHistory(input: {
  familyGroupId: number;
  from: Date;
  to: Date;
  userId?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    eq(locationHistory.familyGroupId, input.familyGroupId),
    gte(locationHistory.createdAt, input.from),
    lte(locationHistory.createdAt, input.to),
  ];
  if (input.userId !== undefined) conditions.push(eq(locationHistory.userId, input.userId));
  const rows = await db
    .select({ location: locationHistory, user: users })
    .from(locationHistory)
    .innerJoin(users, eq(locationHistory.userId, users.id))
    .where(and(...conditions))
    .orderBy(locationHistory.createdAt)
    .limit(input.limit ?? 5000);
  return rows.map(({ location, user }) => ({
    id: location.id,
    userId: location.userId,
    userName: user.name ?? "Family member",
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    accuracy: location.accuracy ?? undefined,
    locationName: location.locationName ?? undefined,
    timestamp: location.createdAt,
  }));
}

export async function getGeofenceAlertState(familyGroupId: number, userId: number, geofenceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(geofenceAlertStates)
    .where(and(
      eq(geofenceAlertStates.familyGroupId, familyGroupId),
      eq(geofenceAlertStates.userId, userId),
      eq(geofenceAlertStates.geofenceId, geofenceId),
    ))
    .limit(1);
  return rows[0];
}

export async function upsertGeofenceAlertState(input: {
  familyGroupId: number;
  userId: number;
  geofenceId: number;
  state: "inside" | "outside";
  lastDistanceMeters: number;
  lastNotifiedAt?: Date | null;
  acknowledgedAt?: Date | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getGeofenceAlertState(input.familyGroupId, input.userId, input.geofenceId);
  const values = {
    state: input.state,
    lastDistanceMeters: input.lastDistanceMeters,
    lastNotifiedAt: input.lastNotifiedAt ?? null,
    acknowledgedAt: input.acknowledgedAt ?? null,
  };
  if (existing) {
    await db.update(geofenceAlertStates).set(values).where(eq(geofenceAlertStates.id, existing.id));
    return { ...existing, ...values };
  }
  await db.insert(geofenceAlertStates).values({
    familyGroupId: input.familyGroupId,
    userId: input.userId,
    geofenceId: input.geofenceId,
    ...values,
  });
  return { familyGroupId: input.familyGroupId, userId: input.userId, geofenceId: input.geofenceId, ...values };
}

export async function acknowledgeGeofenceAlert(userId: number, familyGroupId: number, geofenceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(geofenceAlertStates)
    .set({ acknowledgedAt: new Date() })
    .where(and(
      eq(geofenceAlertStates.userId, userId),
      eq(geofenceAlertStates.familyGroupId, familyGroupId),
      eq(geofenceAlertStates.geofenceId, geofenceId),
    ));
  return { success: true };
}

export async function getRecentFamilyPhotoEntries(familyGroupId: number, since: Date, limit = 24) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timelineEntries)
    .where(and(
      eq(timelineEntries.familyGroupId, familyGroupId),
      eq(timelineEntries.entryType, "photo"),
      gte(timelineEntries.createdAt, since),
    ))
    .orderBy(desc(timelineEntries.createdAt))
    .limit(limit);
}

export async function getPhotoJournalSchedule(familyGroupId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(photoJournalSchedules)
    .where(and(eq(photoJournalSchedules.familyGroupId, familyGroupId), eq(photoJournalSchedules.userId, userId)))
    .limit(1);
  return rows[0];
}

export async function upsertPhotoJournalSchedule(input: {
  familyGroupId: number;
  userId: number;
  enabled: boolean;
  weekday: number;
  hour: number;
  minute: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getPhotoJournalSchedule(input.familyGroupId, input.userId);
  if (existing) {
    await db.update(photoJournalSchedules).set(input).where(eq(photoJournalSchedules.id, existing.id));
    return { ...existing, ...input };
  }
  const result = await db.insert(photoJournalSchedules).values(input);
  return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, scheduleCronTaskUid: null, lastGeneratedAt: null };
}

export async function setPhotoJournalScheduleTaskUid(id: number, scheduleCronTaskUid: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(photoJournalSchedules).set({ scheduleCronTaskUid }).where(eq(photoJournalSchedules.id, id));
  return { success: true };
}

export async function markPhotoJournalGenerated(id: number, generatedAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(photoJournalSchedules).set({ lastGeneratedAt: generatedAt }).where(eq(photoJournalSchedules.id, id));
  return { success: true };
}

export async function createWearableHealthSnapshot(input: {
  familyGroupId: number;
  userId: number;
  steps: number;
  heartRate: number;
  sleepMinutes: number;
  simulatedAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(wearableHealthSnapshots).values({ ...input, source: "simulated" });
  return { ...input, source: "simulated" as const, id: Number((result as { insertId?: number }).insertId ?? 0), createdAt: new Date() };
}

export async function getLatestWearableHealthSnapshot(familyGroupId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(wearableHealthSnapshots)
    .where(and(eq(wearableHealthSnapshots.familyGroupId, familyGroupId), eq(wearableHealthSnapshots.userId, userId)))
    .orderBy(desc(wearableHealthSnapshots.simulatedAt))
    .limit(1);
  return rows[0];
}

export async function getFamilyLatestWearableHealthSnapshots(familyGroupId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(wearableHealthSnapshots)
    .where(eq(wearableHealthSnapshots.familyGroupId, familyGroupId))
    .orderBy(desc(wearableHealthSnapshots.simulatedAt))
    .limit(limit);
  const latestByUser = new Map<number, (typeof rows)[number]>();
  for (const row of rows) {
    if (!latestByUser.has(row.userId)) latestByUser.set(row.userId, row);
  }
  return Array.from(latestByUser.values());
}


export async function createPhotoJournal(input: {
  familyGroupId: number;
  title: string;
  story: string;
  photoUrls: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(photoJournals).values(input);
  return input;
}

export async function getRecentPhotoJournals(familyGroupId: number, limit = 6) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(photoJournals)
    .where(eq(photoJournals.familyGroupId, familyGroupId))
    .orderBy(desc(photoJournals.createdAt))
    .limit(limit);
}


export async function getPhotoJournalScheduleByTaskUid(scheduleCronTaskUid: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(photoJournalSchedules)
    .where(eq(photoJournalSchedules.scheduleCronTaskUid, scheduleCronTaskUid))
    .limit(1);
  return rows[0];
}
