import { and, desc, eq, gte, inArray, isNull, lte } from "drizzle-orm";
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
  familyHomecomingNotes,
  familyReadingRelayEntries,
  familyWeatherMemos,
  familyPlaylistItems,
  familyForgottenItemAlerts,
  familyThankYouBookmarks,
  familyMealRequests,
  familyFunCountdowns,
  familyMemoryQuizzes,
  familyMonthlyGoals,
  familyPhotoCaptions,
  familyQuietTimeSignals,
  familyConsultationCards,
  familySeasonalIdeas,
  familyCareReplies,
  familyDailyQuestions,
  familyDailyQuestionAnswers,
  familyHomePreparationItems,
  familyEncouragementStamps,
  familyWeekendReflections,
  familyGentleReminders,
  familyEveningNotes,
  familyWalkLogs,
  familyHelpedMemos,
  familyTomorrowMemos,
  familySeasonalPhotoPrompts,
  familyHelpGuides,
  familyWeeklyPromises,
  familyTalkTimings,
  familyMemoryBookmarks,
  familyQuestionBoxEntries,
  familyMorningEncouragements,
  familyWeekendHomecomingPlans,
  familyTogetherInvitations,
  familyTogetherResponses,
  familyComfortMeters,
  familyRainyDayIdeas,
  familyDailyJoys,
  familyLaterListenMemos,
  familyTableTopics,
  familyMeetingMarkers,
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

export async function createFamilyHomecomingNote(input: { familyGroupId: number; userId: number; moodSign?: string; note: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, moodSign: input.moodSign ?? null }; const result = await db.insert(familyHomecomingNotes).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyHomecomingNotes(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyHomecomingNotes).where(eq(familyHomecomingNotes.familyGroupId, familyGroupId)).orderBy(desc(familyHomecomingNotes.createdAt)).limit(24) : []; }

export async function createFamilyReadingRelayEntry(input: { familyGroupId: number; userId: number; bookTitle: string; pageCount?: number; quote?: string; reflection?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, pageCount: input.pageCount ?? null, quote: input.quote ?? null, reflection: input.reflection ?? null }; const result = await db.insert(familyReadingRelayEntries).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyReadingRelayEntries(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyReadingRelayEntries).where(eq(familyReadingRelayEntries.familyGroupId, familyGroupId)).orderBy(desc(familyReadingRelayEntries.createdAt)).limit(30) : []; }

export async function createFamilyWeatherMemo(input: { familyGroupId: number; userId: number; weather: "sunny" | "cloudy" | "rainy" | "cold" | "hot" | "other"; clothingNote?: string; carryingNote?: string; bodyNote?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, clothingNote: input.clothingNote ?? null, carryingNote: input.carryingNote ?? null, bodyNote: input.bodyNote ?? null }; const result = await db.insert(familyWeatherMemos).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyWeatherMemos(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyWeatherMemos).where(eq(familyWeatherMemos.familyGroupId, familyGroupId)).orderBy(desc(familyWeatherMemos.createdAt)).limit(24) : []; }

export async function createFamilyPlaylistItem(input: { familyGroupId: number; userId: number; title: string; artist?: string; mood: "morning" | "homecoming" | "weekend" | "other"; message?: string; linkUrl?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, artist: input.artist ?? null, message: input.message ?? null, linkUrl: input.linkUrl ?? null }; const result = await db.insert(familyPlaylistItems).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyPlaylistItems(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyPlaylistItems).where(eq(familyPlaylistItems.familyGroupId, familyGroupId)).orderBy(desc(familyPlaylistItems.createdAt)).limit(30) : []; }

export async function createFamilyForgottenItemAlert(input: { familyGroupId: number; userId: number; itemName: string; note?: string; urgency: "soon" | "urgent" }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyForgottenItemAlerts).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isResolved: false }; }
export async function getFamilyForgottenItemAlerts(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyForgottenItemAlerts).where(eq(familyForgottenItemAlerts.familyGroupId, familyGroupId)).orderBy(desc(familyForgottenItemAlerts.createdAt)).limit(30) : []; }
export async function resolveFamilyForgottenItemAlert(input: { familyGroupId: number; alertId: number; isResolved: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyForgottenItemAlerts).set({ isResolved: input.isResolved }).where(and(eq(familyForgottenItemAlerts.id, input.alertId), eq(familyForgottenItemAlerts.familyGroupId, input.familyGroupId))); }

export async function createFamilyThankYouBookmark(input: { familyGroupId: number; userId: number; message: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyThankYouBookmarks).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyThankYouBookmarks(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyThankYouBookmarks).where(eq(familyThankYouBookmarks.familyGroupId, familyGroupId)).orderBy(desc(familyThankYouBookmarks.createdAt)).limit(60) : []; }

export async function createFamilyMealRequest(input: { familyGroupId: number; userId: number; dishName: string; reason?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, reason: input.reason ?? null }; const result = await db.insert(familyMealRequests).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, status: "open" as const }; }
export async function getFamilyMealRequests(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyMealRequests).where(eq(familyMealRequests.familyGroupId, familyGroupId)).orderBy(desc(familyMealRequests.createdAt)).limit(30) : []; }
export async function updateFamilyMealRequestStatus(input: { familyGroupId: number; requestId: number; status: "open" | "planned" | "served" }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyMealRequests).set({ status: input.status }).where(and(eq(familyMealRequests.id, input.requestId), eq(familyMealRequests.familyGroupId, input.familyGroupId))); }

export async function createFamilyFunCountdown(input: { familyGroupId: number; userId: number; title: string; eventAt: Date; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyFunCountdowns).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyFunCountdowns(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyFunCountdowns).where(eq(familyFunCountdowns.familyGroupId, familyGroupId)).orderBy(familyFunCountdowns.eventAt).limit(24) : []; }

export async function createFamilyMemoryQuiz(input: { familyGroupId: number; userId: number; question: string; optionA: string; optionB: string; optionC: string; correctAnswer: "a" | "b" | "c"; hint?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, hint: input.hint ?? null }; const result = await db.insert(familyMemoryQuizzes).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyMemoryQuizzes(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyMemoryQuizzes).where(eq(familyMemoryQuizzes.familyGroupId, familyGroupId)).orderBy(desc(familyMemoryQuizzes.createdAt)).limit(24) : []; }

export async function createFamilyMonthlyGoal(input: { familyGroupId: number; userId: number; monthKey: string; title: string; encouragement?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, encouragement: input.encouragement ?? null }; const result = await db.insert(familyMonthlyGoals).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isCompleted: false }; }
export async function getFamilyMonthlyGoals(familyGroupId: number, monthKey: string) { const db = await getDb(); return db ? db.select().from(familyMonthlyGoals).where(and(eq(familyMonthlyGoals.familyGroupId, familyGroupId), eq(familyMonthlyGoals.monthKey, monthKey))).orderBy(desc(familyMonthlyGoals.createdAt)) : []; }
export async function updateFamilyMonthlyGoal(input: { familyGroupId: number; goalId: number; isCompleted: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyMonthlyGoals).set({ isCompleted: input.isCompleted }).where(and(eq(familyMonthlyGoals.id, input.goalId), eq(familyMonthlyGoals.familyGroupId, input.familyGroupId))); }

export async function createFamilyPhotoCaption(input: { familyGroupId: number; userId: number; photoId: number; caption: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyPhotoCaptions).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyPhotoCaptions(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyPhotoCaptions).where(eq(familyPhotoCaptions.familyGroupId, familyGroupId)).orderBy(desc(familyPhotoCaptions.createdAt)).limit(60) : []; }

export async function createFamilyQuietTimeSignal(input: { familyGroupId: number; userId: number; state: "focus" | "rest" | "sleeping"; note?: string; untilAt?: Date }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null, untilAt: input.untilAt ?? null }; const result = await db.insert(familyQuietTimeSignals).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyQuietTimeSignals(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyQuietTimeSignals).where(eq(familyQuietTimeSignals.familyGroupId, familyGroupId)).orderBy(desc(familyQuietTimeSignals.createdAt)).limit(48) : []; }

export async function createFamilyConsultationCard(input: { familyGroupId: number; userId: number; kind: "listen" | "advice" | "help"; title: string; detail?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, detail: input.detail ?? null }; const result = await db.insert(familyConsultationCards).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isResolved: false }; }
export async function getFamilyConsultationCards(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyConsultationCards).where(eq(familyConsultationCards.familyGroupId, familyGroupId)).orderBy(desc(familyConsultationCards.createdAt)).limit(30) : []; }
export async function updateFamilyConsultationCard(input: { familyGroupId: number; cardId: number; isResolved: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyConsultationCards).set({ isResolved: input.isResolved }).where(and(eq(familyConsultationCards.id, input.cardId), eq(familyConsultationCards.familyGroupId, input.familyGroupId))); }

export async function createFamilySeasonalIdea(input: { familyGroupId: number; userId: number; season: "spring" | "summer" | "autumn" | "winter" | "anytime"; title: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familySeasonalIdeas).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isPlanned: false }; }
export async function getFamilySeasonalIdeas(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familySeasonalIdeas).where(eq(familySeasonalIdeas.familyGroupId, familyGroupId)).orderBy(desc(familySeasonalIdeas.createdAt)).limit(30) : []; }
export async function updateFamilySeasonalIdea(input: { familyGroupId: number; ideaId: number; isPlanned: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familySeasonalIdeas).set({ isPlanned: input.isPlanned }).where(and(eq(familySeasonalIdeas.id, input.ideaId), eq(familySeasonalIdeas.familyGroupId, input.familyGroupId))); }

export async function createFamilyCareReply(input: { familyGroupId: number; userId: number; reaction: string; message?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, message: input.message ?? null }; const result = await db.insert(familyCareReplies).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyCareReplies(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyCareReplies).where(eq(familyCareReplies.familyGroupId, familyGroupId)).orderBy(desc(familyCareReplies.createdAt)).limit(40) : []; }

export async function createFamilyDailyQuestion(input: { familyGroupId: number; userId: number; dayKey: string; question: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyDailyQuestions).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyDailyQuestions(familyGroupId: number, dayKey: string) { const db = await getDb(); return db ? db.select().from(familyDailyQuestions).where(and(eq(familyDailyQuestions.familyGroupId, familyGroupId), eq(familyDailyQuestions.dayKey, dayKey))).orderBy(desc(familyDailyQuestions.createdAt)).limit(8) : []; }
export async function createFamilyDailyQuestionAnswer(input: { familyGroupId: number; questionId: number; userId: number; answer: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyDailyQuestionAnswers).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyDailyQuestionAnswers(familyGroupId: number, questionIds: number[]) { const db = await getDb(); return db && questionIds.length > 0 ? db.select().from(familyDailyQuestionAnswers).where(and(eq(familyDailyQuestionAnswers.familyGroupId, familyGroupId), inArray(familyDailyQuestionAnswers.questionId, questionIds))).orderBy(desc(familyDailyQuestionAnswers.createdAt)).limit(80) : []; }

export async function createFamilyHomePreparationItem(input: { familyGroupId: number; userId: number; title: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyHomePreparationItems).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isCompleted: false }; }
export async function getFamilyHomePreparationItems(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyHomePreparationItems).where(eq(familyHomePreparationItems.familyGroupId, familyGroupId)).orderBy(desc(familyHomePreparationItems.createdAt)).limit(30) : []; }
export async function updateFamilyHomePreparationItem(input: { familyGroupId: number; itemId: number; isCompleted: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyHomePreparationItems).set({ isCompleted: input.isCompleted }).where(and(eq(familyHomePreparationItems.id, input.itemId), eq(familyHomePreparationItems.familyGroupId, input.familyGroupId))); }

export async function createFamilyEncouragementStamp(input: { familyGroupId: number; userId: number; stamp: "sun" | "heart" | "clap" | "rainbow"; message?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, message: input.message ?? null }; const result = await db.insert(familyEncouragementStamps).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyEncouragementStamps(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyEncouragementStamps).where(eq(familyEncouragementStamps.familyGroupId, familyGroupId)).orderBy(desc(familyEncouragementStamps.createdAt)).limit(40) : []; }

export async function createFamilyWeekendReflection(input: { familyGroupId: number; userId: number; weekKey: string; goodThing: string; nextHope?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, nextHope: input.nextHope ?? null }; const result = await db.insert(familyWeekendReflections).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyWeekendReflections(familyGroupId: number, weekKey: string) { const db = await getDb(); return db ? db.select().from(familyWeekendReflections).where(and(eq(familyWeekendReflections.familyGroupId, familyGroupId), eq(familyWeekendReflections.weekKey, weekKey))).orderBy(desc(familyWeekendReflections.createdAt)).limit(30) : []; }

export async function createFamilyGentleReminder(input: { familyGroupId: number; userId: number; title: string; note?: string; dueAt?: Date }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null, dueAt: input.dueAt ?? null }; const result = await db.insert(familyGentleReminders).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isCompleted: false }; }
export async function getFamilyGentleReminders(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyGentleReminders).where(eq(familyGentleReminders.familyGroupId, familyGroupId)).orderBy(desc(familyGentleReminders.createdAt)).limit(30) : []; }
export async function updateFamilyGentleReminder(input: { familyGroupId: number; reminderId: number; isCompleted: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyGentleReminders).set({ isCompleted: input.isCompleted }).where(and(eq(familyGentleReminders.id, input.reminderId), eq(familyGentleReminders.familyGroupId, input.familyGroupId))); }

export async function createFamilyEveningNote(input: { familyGroupId: number; userId: number; mood: "calm" | "tired" | "happy" | "anxious" | "grateful"; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyEveningNotes).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyEveningNotes(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyEveningNotes).where(eq(familyEveningNotes.familyGroupId, familyGroupId)).orderBy(desc(familyEveningNotes.createdAt)).limit(30) : []; }

export async function createFamilyWalkLog(input: { familyGroupId: number; userId: number; routeTitle: string; spotName?: string; memo?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, spotName: input.spotName ?? null, memo: input.memo ?? null }; const result = await db.insert(familyWalkLogs).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyWalkLogs(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyWalkLogs).where(eq(familyWalkLogs.familyGroupId, familyGroupId)).orderBy(desc(familyWalkLogs.createdAt)).limit(30) : []; }

export async function createFamilyHelpedMemo(input: { familyGroupId: number; userId: number; helperNote: string; reaction?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, reaction: input.reaction ?? null }; const result = await db.insert(familyHelpedMemos).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyHelpedMemos(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyHelpedMemos).where(eq(familyHelpedMemos.familyGroupId, familyGroupId)).orderBy(desc(familyHelpedMemos.createdAt)).limit(30) : []; }

export async function createFamilyTomorrowMemo(input: { familyGroupId: number; userId: number; targetDate: Date; kind: "plan" | "care" | "fun"; note: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyTomorrowMemos).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyTomorrowMemos(familyGroupId: number, from: Date, to: Date) { const db = await getDb(); return db ? db.select().from(familyTomorrowMemos).where(and(eq(familyTomorrowMemos.familyGroupId, familyGroupId), gte(familyTomorrowMemos.targetDate, from), lte(familyTomorrowMemos.targetDate, to))).orderBy(familyTomorrowMemos.targetDate, desc(familyTomorrowMemos.createdAt)).limit(30) : []; }

export async function createFamilySeasonalPhotoPrompt(input: { familyGroupId: number; userId: number; monthKey: string; theme: string; detail?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, detail: input.detail ?? null }; const result = await db.insert(familySeasonalPhotoPrompts).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isActive: true }; }
export async function getFamilySeasonalPhotoPrompts(familyGroupId: number, monthKey: string) { const db = await getDb(); return db ? db.select().from(familySeasonalPhotoPrompts).where(and(eq(familySeasonalPhotoPrompts.familyGroupId, familyGroupId), eq(familySeasonalPhotoPrompts.monthKey, monthKey))).orderBy(desc(familySeasonalPhotoPrompts.createdAt)).limit(20) : []; }
export async function updateFamilySeasonalPhotoPrompt(input: { familyGroupId: number; promptId: number; isActive: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familySeasonalPhotoPrompts).set({ isActive: input.isActive }).where(and(eq(familySeasonalPhotoPrompts.id, input.promptId), eq(familySeasonalPhotoPrompts.familyGroupId, input.familyGroupId))); }

export async function createFamilyHelpGuide(input: { familyGroupId: number; userId: number; category: "housework" | "device" | "health" | "other"; title: string; steps: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyHelpGuides).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, isPinned: false }; }
export async function getFamilyHelpGuides(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyHelpGuides).where(eq(familyHelpGuides.familyGroupId, familyGroupId)).orderBy(desc(familyHelpGuides.isPinned), desc(familyHelpGuides.createdAt)).limit(30) : []; }
export async function updateFamilyHelpGuidePinned(input: { familyGroupId: number; guideId: number; isPinned: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyHelpGuides).set({ isPinned: input.isPinned }).where(and(eq(familyHelpGuides.id, input.guideId), eq(familyHelpGuides.familyGroupId, input.familyGroupId))); }

export async function createFamilyWeeklyPromise(input: { familyGroupId: number; userId: number; weekKey: string; title: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyWeeklyPromises).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isCompleted: false }; }
export async function getFamilyWeeklyPromises(familyGroupId: number, weekKey: string) { const db = await getDb(); return db ? db.select().from(familyWeeklyPromises).where(and(eq(familyWeeklyPromises.familyGroupId, familyGroupId), eq(familyWeeklyPromises.weekKey, weekKey))).orderBy(desc(familyWeeklyPromises.createdAt)).limit(30) : []; }
export async function updateFamilyWeeklyPromise(input: { familyGroupId: number; promiseId: number; isCompleted: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyWeeklyPromises).set({ isCompleted: input.isCompleted }).where(and(eq(familyWeeklyPromises.id, input.promiseId), eq(familyWeeklyPromises.familyGroupId, input.familyGroupId))); }

export async function createFamilyTalkTiming(input: { familyGroupId: number; userId: number; state: "available" | "later" | "quiet"; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyTalkTimings).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyTalkTimings(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyTalkTimings).where(eq(familyTalkTimings.familyGroupId, familyGroupId)).orderBy(desc(familyTalkTimings.createdAt)).limit(30) : []; }

export async function createFamilyMemoryBookmark(input: { familyGroupId: number; userId: number; sourceType: "photo" | "post" | "other"; sourceLabel: string; reason: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyMemoryBookmarks).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyMemoryBookmarks(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyMemoryBookmarks).where(eq(familyMemoryBookmarks.familyGroupId, familyGroupId)).orderBy(desc(familyMemoryBookmarks.createdAt)).limit(30) : []; }

export async function createFamilyQuestionBoxEntry(input: { familyGroupId: number; userId: number; question: string; isAnonymous: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyQuestionBoxEntries).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, isOpened: false }; }
export async function getFamilyQuestionBoxEntries(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyQuestionBoxEntries).where(eq(familyQuestionBoxEntries.familyGroupId, familyGroupId)).orderBy(familyQuestionBoxEntries.isOpened, desc(familyQuestionBoxEntries.createdAt)).limit(30) : []; }
export async function updateFamilyQuestionBoxEntry(input: { familyGroupId: number; entryId: number; isOpened: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyQuestionBoxEntries).set({ isOpened: input.isOpened }).where(and(eq(familyQuestionBoxEntries.id, input.entryId), eq(familyQuestionBoxEntries.familyGroupId, input.familyGroupId))); }

export async function createFamilyMorningEncouragement(input: { familyGroupId: number; userId: number; message: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyMorningEncouragements).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyMorningEncouragements(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyMorningEncouragements).where(eq(familyMorningEncouragements.familyGroupId, familyGroupId)).orderBy(desc(familyMorningEncouragements.createdAt)).limit(24) : []; }

export async function createFamilyWeekendHomecomingPlan(input: { familyGroupId: number; userId: number; plannedAt: Date; meetingPlace?: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, meetingPlace: input.meetingPlace ?? null, note: input.note ?? null }; const result = await db.insert(familyWeekendHomecomingPlans).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isConfirmed: false }; }
export async function getFamilyWeekendHomecomingPlans(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyWeekendHomecomingPlans).where(eq(familyWeekendHomecomingPlans.familyGroupId, familyGroupId)).orderBy(familyWeekendHomecomingPlans.plannedAt).limit(30) : []; }
export async function updateFamilyWeekendHomecomingPlan(input: { familyGroupId: number; planId: number; isConfirmed: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyWeekendHomecomingPlans).set({ isConfirmed: input.isConfirmed }).where(and(eq(familyWeekendHomecomingPlans.id, input.planId), eq(familyWeekendHomecomingPlans.familyGroupId, input.familyGroupId))); }

export async function createFamilyTogetherInvitation(input: { familyGroupId: number; userId: number; kind: "chore" | "hobby" | "other"; title: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyTogetherInvitations).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isClosed: false }; }
export async function getFamilyTogetherInvitations(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyTogetherInvitations).where(eq(familyTogetherInvitations.familyGroupId, familyGroupId)).orderBy(familyTogetherInvitations.isClosed, desc(familyTogetherInvitations.createdAt)).limit(30) : []; }
export async function updateFamilyTogetherInvitation(input: { familyGroupId: number; invitationId: number; isClosed: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyTogetherInvitations).set({ isClosed: input.isClosed }).where(and(eq(familyTogetherInvitations.id, input.invitationId), eq(familyTogetherInvitations.familyGroupId, input.familyGroupId))); }
export async function createFamilyTogetherResponse(input: { invitationId: number; userId: number; response: "join" | "maybe" }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyTogetherResponses).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyTogetherResponses(invitationId: number) { const db = await getDb(); return db ? db.select().from(familyTogetherResponses).where(eq(familyTogetherResponses.invitationId, invitationId)).orderBy(desc(familyTogetherResponses.createdAt)).limit(30) : []; }

export async function createFamilyComfortMeter(input: { familyGroupId: number; userId: number; color: "sunny" | "soft" | "cloudy" | "rainy"; message?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, message: input.message ?? null }; const result = await db.insert(familyComfortMeters).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values }; }
export async function getFamilyComfortMeters(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyComfortMeters).where(eq(familyComfortMeters.familyGroupId, familyGroupId)).orderBy(desc(familyComfortMeters.createdAt)).limit(30) : []; }

export async function createFamilyRainyDayIdea(input: { familyGroupId: number; userId: number; title: string; detail?: string; mood: "quiet" | "creative" | "active" }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, detail: input.detail ?? null }; const result = await db.insert(familyRainyDayIdeas).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isTried: false }; }
export async function getFamilyRainyDayIdeas(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyRainyDayIdeas).where(eq(familyRainyDayIdeas.familyGroupId, familyGroupId)).orderBy(familyRainyDayIdeas.isTried, desc(familyRainyDayIdeas.createdAt)).limit(30) : []; }
export async function updateFamilyRainyDayIdea(input: { familyGroupId: number; ideaId: number; isTried: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyRainyDayIdeas).set({ isTried: input.isTried }).where(and(eq(familyRainyDayIdeas.id, input.ideaId), eq(familyRainyDayIdeas.familyGroupId, input.familyGroupId))); }

export async function createFamilyDailyJoy(input: { familyGroupId: number; userId: number; dayKey: string; joy: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyDailyJoys).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input }; }
export async function getFamilyDailyJoys(familyGroupId: number, dayKey: string) { const db = await getDb(); return db ? db.select().from(familyDailyJoys).where(and(eq(familyDailyJoys.familyGroupId, familyGroupId), eq(familyDailyJoys.dayKey, dayKey))).orderBy(desc(familyDailyJoys.createdAt)).limit(30) : []; }

export async function createFamilyLaterListenMemo(input: { familyGroupId: number; userId: number; title: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, note: input.note ?? null }; const result = await db.insert(familyLaterListenMemos).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isFollowedUp: false }; }
export async function getFamilyLaterListenMemos(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyLaterListenMemos).where(eq(familyLaterListenMemos.familyGroupId, familyGroupId)).orderBy(familyLaterListenMemos.isFollowedUp, desc(familyLaterListenMemos.createdAt)).limit(30) : []; }
export async function updateFamilyLaterListenMemo(input: { familyGroupId: number; memoId: number; isFollowedUp: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyLaterListenMemos).set({ isFollowedUp: input.isFollowedUp }).where(and(eq(familyLaterListenMemos.id, input.memoId), eq(familyLaterListenMemos.familyGroupId, input.familyGroupId))); }

export async function createFamilyTableTopic(input: { familyGroupId: number; userId: number; tone: "laugh" | "share" | "think"; topic: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const result = await db.insert(familyTableTopics).values(input); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...input, isDiscussed: false }; }
export async function getFamilyTableTopics(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyTableTopics).where(eq(familyTableTopics.familyGroupId, familyGroupId)).orderBy(familyTableTopics.isDiscussed, desc(familyTableTopics.createdAt)).limit(30) : []; }
export async function updateFamilyTableTopic(input: { familyGroupId: number; topicId: number; isDiscussed: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyTableTopics).set({ isDiscussed: input.isDiscussed }).where(and(eq(familyTableTopics.id, input.topicId), eq(familyTableTopics.familyGroupId, input.familyGroupId))); }

export async function createFamilyMeetingMarker(input: { familyGroupId: number; userId: number; locationHint: string; appearanceHint?: string; note?: string }) { const db = await getDb(); if (!db) throw new Error("Database not available"); const values = { ...input, appearanceHint: input.appearanceHint ?? null, note: input.note ?? null }; const result = await db.insert(familyMeetingMarkers).values(values); return { id: Number((result as { insertId?: number }).insertId ?? 0), ...values, isActive: true }; }
export async function getFamilyMeetingMarkers(familyGroupId: number) { const db = await getDb(); return db ? db.select().from(familyMeetingMarkers).where(eq(familyMeetingMarkers.familyGroupId, familyGroupId)).orderBy(familyMeetingMarkers.isActive, desc(familyMeetingMarkers.createdAt)).limit(30) : []; }
export async function updateFamilyMeetingMarker(input: { familyGroupId: number; markerId: number; isActive: boolean }) { const db = await getDb(); if (!db) throw new Error("Database not available"); return db.update(familyMeetingMarkers).set({ isActive: input.isActive }).where(and(eq(familyMeetingMarkers.id, input.markerId), eq(familyMeetingMarkers.familyGroupId, input.familyGroupId))); }
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
