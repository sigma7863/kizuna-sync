import { decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Family groups - represents a family unit that members can join
 */
export const familyGroups = mysqlTable("family_groups", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FamilyGroup = typeof familyGroups.$inferSelect;
export type InsertFamilyGroup = typeof familyGroups.$inferInsert;

/**
 * Family members - links users to family groups with role-based access
 */
export const familyMembers = mysqlTable("family_members", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  memberRole: mysqlEnum("member_role", ["guardian", "child", "elderly"]).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;

/**
 * Family invitations - temporary tokens for inviting new members
 */
export const familyInvitations = mysqlTable("family_invitations", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  invitationCode: varchar("invitation_code", { length: 64 }).notNull().unique(),
  invitedEmail: varchar("invited_email", { length: 320 }),
  suggestedRole: mysqlEnum("suggested_role", ["guardian", "child", "elderly"]).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type FamilyInvitation = typeof familyInvitations.$inferSelect;
export type InsertFamilyInvitation = typeof familyInvitations.$inferInsert;

/**
 * User activities - tracks user actions (walking, photo, music, etc.)
 */
export const userActivities = mysqlTable("user_activities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  familyGroupId: int("family_group_id").notNull(),
  activityType: mysqlEnum("activity_type", ["walking", "photo", "music", "location", "mood", "message"]).notNull(),
  activityData: json("activity_data"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = typeof userActivities.$inferInsert;

/**
 * Timeline entries - family timeline posts/updates
 */
export const timelineEntries = mysqlTable("timeline_entries", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  entryType: mysqlEnum("entry_type", ["mood", "photo", "message", "location", "activity"]).notNull(),
  content: text("content"),
  imageUrl: varchar("image_url", { length: 512 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TimelineEntry = typeof timelineEntries.$inferSelect;
export type InsertTimelineEntry = typeof timelineEntries.$inferInsert;

/**
 * Family album photos - original files live in S3 while this table stores
 * family ownership, AI-generated metadata, and the favorite state.
 */
export const familyAlbumPhotos = mysqlTable("family_album_photos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  fileKey: varchar("file_key", { length: 512 }).notNull(),
  imageUrl: varchar("image_url", { length: 512 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  description: text("description"),
  tags: json("tags"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("family_album_photos_group_created_idx").on(table.familyGroupId, table.createdAt),
  index("family_album_photos_group_favorite_idx").on(table.familyGroupId, table.isFavorite),
]);

export type FamilyAlbumPhoto = typeof familyAlbumPhotos.$inferSelect;
export type InsertFamilyAlbumPhoto = typeof familyAlbumPhotos.$inferInsert;

/**
 * Family help requests - lightweight, family-visible requests that can be
 * accepted and completed by another member.
 */
export const familyHelpRequests = mysqlTable("family_help_requests", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  requesterUserId: int("requester_user_id").notNull(),
  helperUserId: int("helper_user_id"),
  title: varchar("title", { length: 160 }).notNull(),
  detail: text("detail"),
  status: mysqlEnum("status", ["open", "accepted", "completed"]).default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("family_help_requests_group_status_idx").on(table.familyGroupId, table.status),
]);

export type FamilyHelpRequest = typeof familyHelpRequests.$inferSelect;
export type InsertFamilyHelpRequest = typeof familyHelpRequests.$inferInsert;

/** Shared shopping checklist for lightweight household coordination. */
export const familyShoppingItems = mysqlTable("family_shopping_items", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  purchasedByUserId: int("purchased_by_user_id"),
  itemName: varchar("item_name", { length: 160 }).notNull(),
  quantity: varchar("quantity", { length: 80 }),
  isPurchased: boolean("is_purchased").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("family_shopping_items_group_purchased_idx").on(table.familyGroupId, table.isPurchased)]);

/** Messages kept private to a family until a future scheduled opening date. */
export const familyTimeCapsules = mysqlTable("family_time_capsules", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  creatorUserId: int("creator_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  message: text("message").notNull(),
  opensAt: timestamp("opens_at").notNull(),
  openedAt: timestamp("opened_at"),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("family_time_capsules_group_opens_idx").on(table.familyGroupId, table.opensAt),
  index("family_time_capsules_task_uid_idx").on(table.scheduleCronTaskUid),
]);

/** A gentle, family-visible pulse question whose responses are only aggregated. */
export const familyPolls = mysqlTable("family_polls", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  creatorUserId: int("creator_user_id").notNull(),
  question: varchar("question", { length: 240 }).notNull(),
  options: json("options").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_polls_group_ends_idx").on(table.familyGroupId, table.endsAt)]);

export const familyPollResponses = mysqlTable("family_poll_responses", {
  id: int("id").autoincrement().primaryKey(),
  pollId: int("poll_id").notNull(),
  respondentUserId: int("respondent_user_id").notNull(),
  optionIndex: int("option_index").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_poll_responses_poll_user_idx").on(table.pollId, table.respondentUserId)]);

export type FamilyShoppingItem = typeof familyShoppingItems.$inferSelect;
export type FamilyTimeCapsule = typeof familyTimeCapsules.$inferSelect;
export type FamilyPoll = typeof familyPolls.$inferSelect;
export type FamilyPollResponse = typeof familyPollResponses.$inferSelect;

/** Shared emergency preparation items for a family's disaster-readiness check. */
export const familySafetyChecklistItems = mysqlTable("family_safety_checklist_items", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("family_safety_checklist_group_done_idx").on(table.familyGroupId, table.isCompleted)]);

/** Family celebrations announced at a selected calendar date. */
export const familyCelebrationDates = mysqlTable("family_celebration_dates", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  celebrationAt: timestamp("celebration_at").notNull(),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
  celebratedAt: timestamp("celebrated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("family_celebration_dates_group_at_idx").on(table.familyGroupId, table.celebrationAt),
  index("family_celebration_dates_task_uid_idx").on(table.scheduleCronTaskUid),
]);

/**
 * Photo journal - AI-generated photo stories
 */
export const photoJournals = mysqlTable("photo_journals", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  story: text("story"),
  photoUrls: json("photo_urls"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PhotoJournal = typeof photoJournals.$inferSelect;
export type InsertPhotoJournal = typeof photoJournals.$inferInsert;

export const familyContactCards = mysqlTable("family_contact_cards", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_contact_cards_group_idx").on(table.familyGroupId)]);

export const familyGentleRules = mysqlTable("family_gentle_rules", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  detail: text("detail"),
  isAgreed: boolean("is_agreed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("family_gentle_rules_group_idx").on(table.familyGroupId)]);

/** Shared weekend activity ideas, created and refined by family members. */
export const familyWeekendPlans = mysqlTable("family_weekend_plans", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: text("description"),
  activityType: mysqlEnum("activity_type", ["indoor", "outdoor", "hybrid"]).notNull(),
  sharedPollId: int("shared_poll_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("family_weekend_plans_group_created_idx").on(table.familyGroupId, table.createdAt),
  index("family_weekend_plans_group_shared_idx").on(table.familyGroupId, table.sharedPollId),
]);

export type FamilyWeekendPlan = typeof familyWeekendPlans.$inferSelect;

/** A member-maintained map of strengths and ways their family can rely on them. */
export const familyRoleProfiles = mysqlTable("family_role_profiles", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  strengths: json("strengths").notNull(),
  supportNote: varchar("support_note", { length: 240 }),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("family_role_profiles_group_user_idx").on(table.familyGroupId, table.userId)]);

export type FamilyRoleProfile = typeof familyRoleProfiles.$inferSelect;

/** Theme-organized recommendations shared within a family. */
export const familyBookshelfItems = mysqlTable("family_bookshelf_items", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  resourceType: mysqlEnum("resource_type", ["book", "video", "article"]).notNull(),
  theme: varchar("theme", { length: 80 }).notNull(),
  resourceUrl: varchar("resource_url", { length: 512 }),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_bookshelf_items_group_created_idx").on(table.familyGroupId, table.createdAt)]);

export type FamilyBookshelfItem = typeof familyBookshelfItems.$inferSelect;

/** Shared outing details and their collaborative preparation checklists. */
export const familyOutings = mysqlTable("family_outings", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  meetingAt: timestamp("meeting_at").notNull(),
  meetingPlace: varchar("meeting_place", { length: 180 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_outings_group_meeting_idx").on(table.familyGroupId, table.meetingAt)]);

export const familyOutingChecklistItems = mysqlTable("family_outing_checklist_items", {
  id: int("id").autoincrement().primaryKey(),
  outingId: int("outing_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  label: varchar("label", { length: 180 }).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => [index("family_outing_checklist_items_outing_done_idx").on(table.outingId, table.isCompleted)]);

export type FamilyOuting = typeof familyOutings.$inferSelect;
export type FamilyOutingChecklistItem = typeof familyOutingChecklistItems.$inferSelect;

/** Meal ideas suggested by family members, with a gentle shared selection state. */
export const familyMealIdeas = mysqlTable("family_meal_ideas", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  ideaType: mysqlEnum("idea_type", ["want", "can_make"]).notNull(),
  note: varchar("note", { length: 240 }),
  isSelected: boolean("is_selected").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_meal_ideas_group_selected_idx").on(table.familyGroupId, table.isSelected)]);

export type FamilyMealIdea = typeof familyMealIdeas.$inferSelect;

/** Small, recurring family care tasks such as pet, plant, and household care. */
export const familyCareDuties = mysqlTable("family_care_duties", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  assignedUserId: int("assigned_user_id"),
  careTarget: varchar("care_target", { length: 80 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  dueOn: timestamp("due_on"),
  status: mysqlEnum("status", ["open", "done"]).default("open").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_care_duties_group_status_idx").on(table.familyGroupId, table.status)]);

export type FamilyCareDuty = typeof familyCareDuties.$inferSelect;

/** Family-contributed prompts for spontaneous play and conversation. */
export const familyFunPrompts = mysqlTable("family_fun_prompts", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  content: varchar("content", { length: 240 }).notNull(),
  theme: varchar("theme", { length: 80 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_fun_prompts_group_created_idx").on(table.familyGroupId, table.createdAt)]);

export type FamilyFunPrompt = typeof familyFunPrompts.$inferSelect;

/** Short caring notes exchanged inside the family with a gentle read state. */
export const familyCareMessages = mysqlTable("family_care_messages", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  senderUserId: int("sender_user_id").notNull(),
  recipientUserId: int("recipient_user_id"),
  message: varchar("message", { length: 180 }).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_care_messages_group_read_idx").on(table.familyGroupId, table.isRead)]);

export type FamilyCareMessage = typeof familyCareMessages.$inferSelect;

/** Shared family items that can be lent and returned with a gentle status. */
export const familySharedItems = mysqlTable("family_shared_items", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  ownerUserId: int("owner_user_id").notNull(),
  borrowerUserId: int("borrower_user_id"),
  itemName: varchar("item_name", { length: 160 }).notNull(),
  note: varchar("note", { length: 240 }),
  status: mysqlEnum("status", ["available", "borrowed", "returned"]).default("available").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_shared_items_group_status_idx").on(table.familyGroupId, table.status)]);

export type FamilySharedItem = typeof familySharedItems.$inferSelect;

/** Shared monthly challenge for the family with simple collaborative progress tracking. */
export const familyMonthlyChallenges = mysqlTable("family_monthly_challenges", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: varchar("description", { length: 240 }),
  targetCount: int("target_count").notNull(),
  progressCount: int("progress_count").default(0).notNull(),
  celebrationNote: varchar("celebration_note", { length: 180 }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_monthly_challenges_group_done_idx").on(table.familyGroupId, table.isCompleted)]);

export type FamilyMonthlyChallenge = typeof familyMonthlyChallenges.$inferSelect;

/** Family-recommended walking routes with practical safety notes and highlights. */
export const familyWalkRoutes = mysqlTable("family_walk_routes", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  description: varchar("description", { length: 500 }),
  startPoint: varchar("start_point", { length: 180 }).notNull(),
  highlights: varchar("highlights", { length: 500 }),
  distanceKm: decimal("distance_km", { precision: 5, scale: 2 }).notNull(),
  durationMin: int("duration_min").notNull(),
  safetyNote: varchar("safety_note", { length: 280 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_walk_routes_group_created_idx").on(table.familyGroupId, table.createdAt)]);

export type FamilyWalkRoute = typeof familyWalkRoutes.$inferSelect;

/** Small learning cards shared from books, school, work, and everyday discoveries. */
export const familyLearningCards = mysqlTable("family_learning_cards", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  source: varchar("source", { length: 180 }),
  sourceType: mysqlEnum("source_type", ["book", "school", "work", "other"]).notNull(),
  insight: varchar("insight", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_learning_cards_group_created_idx").on(table.familyGroupId, table.createdAt)]);

export type FamilyLearningCard = typeof familyLearningCards.$inferSelect;

/** A compact daily memory that combines an optional family album photo, mood, and note. */
export const familyDailyMoments = mysqlTable("family_daily_moments", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  photoId: int("photo_id"),
  moodSign: varchar("mood_sign", { length: 32 }),
  note: varchar("note", { length: 280 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_daily_moments_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyDailyMoment = typeof familyDailyMoments.$inferSelect;

/** User-defined, small movement actions for a family-friendly bingo board. */
export const familyMovementBingoCells = mysqlTable("family_movement_bingo_cells", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 16 }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_movement_bingo_cells_group_done_idx").on(table.familyGroupId, table.isCompleted)]);
export type FamilyMovementBingoCell = typeof familyMovementBingoCells.$inferSelect;

/** Notes brought home from school, work, and outings, with a gentle resolution state. */
export const familyTakeHomeNotes = mysqlTable("family_take_home_notes", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  category: mysqlEnum("category", ["school", "work", "outing", "other"]).default("other").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  content: varchar("content", { length: 500 }).notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_take_home_notes_group_resolved_idx").on(table.familyGroupId, table.isResolved)]);
export type FamilyTakeHomeNote = typeof familyTakeHomeNotes.$inferSelect;

/** Warm, concise encouragements shared between family members. */
export const familyEncouragementPosts = mysqlTable("family_encouragement_posts", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  senderUserId: int("sender_user_id").notNull(),
  recipientUserId: int("recipient_user_id"),
  message: varchar("message", { length: 180 }).notNull(),
  stamp: varchar("stamp", { length: 16 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_encouragement_posts_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyEncouragementPost = typeof familyEncouragementPosts.$inferSelect;

/** Self-reported daily energy level to help family members communicate capacity gently. */
export const familyEnergyStatuses = mysqlTable("family_energy_statuses", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  energyLevel: int("energy_level").notNull(),
  note: varchar("note", { length: 160 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_energy_statuses_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyEnergyStatus = typeof familyEnergyStatuses.$inferSelect;

/** Shared wishlist of places, activities, and small challenges the family wants to try. */
export const familyWishListItems = mysqlTable("family_wish_list_items", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  createdByUserId: int("created_by_user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  category: mysqlEnum("category", ["place", "activity", "challenge", "other"]).default("activity").notNull(),
  note: varchar("note", { length: 240 }),
  status: mysqlEnum("status", ["wish", "candidate", "done"]).default("wish").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_wish_list_items_group_status_idx").on(table.familyGroupId, table.status)]);
export type FamilyWishListItem = typeof familyWishListItems.$inferSelect;

/** A lightweight morning plan and readiness signal shared by each family member. */
export const familyMorningPlans = mysqlTable("family_morning_plans", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  departureTime: varchar("departure_time", { length: 5 }),
  moodSign: varchar("mood_sign", { length: 32 }),
  carryingItems: varchar("carrying_items", { length: 280 }),
  isReady: boolean("is_ready").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_morning_plans_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyMorningPlan = typeof familyMorningPlans.$inferSelect;

/** Audio memos are stored in S3 while this table keeps family ownership and playback metadata. */
export const familyVoiceMemos = mysqlTable("family_voice_memos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  fileKey: varchar("file_key", { length: 512 }).notNull(),
  audioUrl: varchar("audio_url", { length: 512 }).notNull(),
  mimeType: varchar("mime_type", { length: 64 }).notNull(),
  durationSeconds: int("duration_seconds").notNull(),
  note: varchar("note", { length: 180 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_voice_memos_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyVoiceMemo = typeof familyVoiceMemos.$inferSelect;

/** A compact, user-created record of completed helpful, healthy, or brave actions. */
export const familyAchievementEntries = mysqlTable("family_achievement_entries", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  category: mysqlEnum("category", ["help", "movement", "challenge", "other"]).default("other").notNull(),
  note: varchar("note", { length: 240 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_achievement_entries_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyAchievementEntry = typeof familyAchievementEntries.$inferSelect;

/** Brief arrival notes that let a family share a safe homecoming and current mood. */
export const familyHomecomingNotes = mysqlTable("family_homecoming_notes", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  moodSign: varchar("mood_sign", { length: 32 }),
  note: varchar("note", { length: 180 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_homecoming_notes_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyHomecomingNote = typeof familyHomecomingNotes.$inferSelect;

/** Reading fragments and favorite passages exchanged between family members. */
export const familyReadingRelayEntries = mysqlTable("family_reading_relay_entries", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  bookTitle: varchar("book_title", { length: 180 }).notNull(),
  pageCount: int("page_count"),
  quote: varchar("quote", { length: 300 }),
  reflection: varchar("reflection", { length: 300 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_reading_relay_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyReadingRelayEntry = typeof familyReadingRelayEntries.$inferSelect;

/** Self-authored weather-aware notes about clothing, carrying items, and body comfort. */
export const familyWeatherMemos = mysqlTable("family_weather_memos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  weather: mysqlEnum("weather", ["sunny", "cloudy", "rainy", "cold", "hot", "other"]).default("other").notNull(),
  clothingNote: varchar("clothing_note", { length: 180 }),
  carryingNote: varchar("carrying_note", { length: 180 }),
  bodyNote: varchar("body_note", { length: 180 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_weather_memos_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyWeatherMemo = typeof familyWeatherMemos.$inferSelect;

/** Song references shared with a mood and small personal note, without hosting music files. */
export const familyPlaylistItems = mysqlTable("family_playlist_items", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  artist: varchar("artist", { length: 160 }),
  mood: mysqlEnum("mood", ["morning", "homecoming", "weekend", "other"]).default("other").notNull(),
  message: varchar("message", { length: 240 }),
  linkUrl: varchar("link_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_playlist_items_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyPlaylistItem = typeof familyPlaylistItems.$inferSelect;

/** A kind, family-visible alert about something that may have been left behind. */
export const familyForgottenItemAlerts = mysqlTable("family_forgotten_item_alerts", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  itemName: varchar("item_name", { length: 160 }).notNull(),
  note: varchar("note", { length: 240 }),
  urgency: mysqlEnum("urgency", ["soon", "urgent"]).default("soon").notNull(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_forgotten_item_alerts_group_resolved_idx").on(table.familyGroupId, table.isResolved)]);
export type FamilyForgottenItemAlert = typeof familyForgottenItemAlerts.$inferSelect;

/** Dated gratitude bookmarks for rereading a family's positive moments later. */
export const familyThankYouBookmarks = mysqlTable("family_thank_you_bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  message: varchar("message", { length: 240 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_thank_you_bookmarks_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyThankYouBookmark = typeof familyThankYouBookmarks.$inferSelect;

/** A direct, kind request for a dish and the reason it would make the day better. */
export const familyMealRequests = mysqlTable("family_meal_requests", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  dishName: varchar("dish_name", { length: 160 }).notNull(),
  reason: varchar("reason", { length: 240 }),
  status: mysqlEnum("status", ["open", "planned", "served"]).default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_meal_requests_group_status_idx").on(table.familyGroupId, table.status)]);
export type FamilyMealRequest = typeof familyMealRequests.$inferSelect;

/** Shared upcoming family moments for a warm, visible countdown. */
export const familyFunCountdowns = mysqlTable("family_fun_countdowns", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  eventAt: timestamp("event_at").notNull(),
  note: varchar("note", { length: 240 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_fun_countdowns_group_event_idx").on(table.familyGroupId, table.eventAt)]);
export type FamilyFunCountdown = typeof familyFunCountdowns.$inferSelect;

/** Family-authored multiple choice questions around real shared memories. */
export const familyMemoryQuizzes = mysqlTable("family_memory_quizzes", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  question: varchar("question", { length: 300 }).notNull(),
  optionA: varchar("option_a", { length: 180 }).notNull(),
  optionB: varchar("option_b", { length: 180 }).notNull(),
  optionC: varchar("option_c", { length: 180 }).notNull(),
  correctAnswer: mysqlEnum("correct_answer", ["a", "b", "c"]).notNull(),
  hint: varchar("hint", { length: 240 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_memory_quizzes_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyMemoryQuiz = typeof familyMemoryQuizzes.$inferSelect;

/** Monthly, family-visible personal goals and optional encouragement. */
export const familyMonthlyGoals = mysqlTable("family_monthly_goals", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  monthKey: varchar("month_key", { length: 7 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  encouragement: varchar("encouragement", { length: 240 }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_monthly_goals_group_month_idx").on(table.familyGroupId, table.monthKey)]);
export type FamilyMonthlyGoal = typeof familyMonthlyGoals.$inferSelect;

/** Family members can add a human context caption to an existing shared photo. */
export const familyPhotoCaptions = mysqlTable("family_photo_captions", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  photoId: int("photo_id").notNull(),
  caption: varchar("caption", { length: 280 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_photo_captions_group_photo_idx").on(table.familyGroupId, table.photoId)]);
export type FamilyPhotoCaption = typeof familyPhotoCaptions.$inferSelect;

/** Voluntary signals that invite family members to respect focus, rest, or sleep time. */
export const familyQuietTimeSignals = mysqlTable("family_quiet_time_signals", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  state: mysqlEnum("state", ["focus", "rest", "sleeping"]).notNull(),
  note: varchar("note", { length: 180 }),
  untilAt: timestamp("until_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_quiet_time_signals_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyQuietTimeSignal = typeof familyQuietTimeSignals.$inferSelect;

/** A family-only space to ask to be heard, advised, or gently helped. */
export const familyConsultationCards = mysqlTable("family_consultation_cards", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  kind: mysqlEnum("kind", ["listen", "advice", "help"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  detail: varchar("detail", { length: 500 }),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_consultation_cards_group_resolved_idx").on(table.familyGroupId, table.isResolved)]);
export type FamilyConsultationCard = typeof familyConsultationCards.$inferSelect;

/** Season-tagged, family-authored ideas that can become an upcoming plan. */
export const familySeasonalIdeas = mysqlTable("family_seasonal_ideas", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  season: mysqlEnum("season", ["spring", "summer", "autumn", "winter", "anytime"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  note: varchar("note", { length: 240 }),
  isPlanned: boolean("is_planned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_seasonal_ideas_group_season_idx").on(table.familyGroupId, table.season)]);
export type FamilySeasonalIdea = typeof familySeasonalIdeas.$inferSelect;

/** Brief positive replies to safety check-ins and everyday care. */
export const familyCareReplies = mysqlTable("family_care_replies", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  reaction: varchar("reaction", { length: 80 }).notNull(),
  message: varchar("message", { length: 180 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_care_replies_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyCareReply = typeof familyCareReplies.$inferSelect;

/** A family-created daily conversation prompt. */
export const familyDailyQuestions = mysqlTable("family_daily_questions", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  dayKey: varchar("day_key", { length: 10 }).notNull(),
  question: varchar("question", { length: 280 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_daily_questions_group_day_idx").on(table.familyGroupId, table.dayKey)]);
export type FamilyDailyQuestion = typeof familyDailyQuestions.$inferSelect;

/** An answer to a daily family conversation prompt. */
export const familyDailyQuestionAnswers = mysqlTable("family_daily_question_answers", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  questionId: int("question_id").notNull(),
  userId: int("user_id").notNull(),
  answer: varchar("answer", { length: 280 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_daily_question_answers_question_idx").on(table.familyGroupId, table.questionId)]);
export type FamilyDailyQuestionAnswer = typeof familyDailyQuestionAnswers.$inferSelect;

/** Small preparations that help the household welcome each other home with less rush. */
export const familyHomePreparationItems = mysqlTable("family_home_preparation_items", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  note: varchar("note", { length: 240 }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_home_preparation_group_completed_idx").on(table.familyGroupId, table.isCompleted)]);
export type FamilyHomePreparationItem = typeof familyHomePreparationItems.$inferSelect;

/** Lightweight encouragement reactions that can accompany or stand in for words. */
export const familyEncouragementStamps = mysqlTable("family_encouragement_stamps", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  stamp: mysqlEnum("stamp", ["sun", "heart", "clap", "rainbow"]).notNull(),
  message: varchar("message", { length: 180 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_encouragement_stamps_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyEncouragementStamp = typeof familyEncouragementStamps.$inferSelect;

/** Weekly reflections that preserve what went well and what the family hopes to enjoy next. */
export const familyWeekendReflections = mysqlTable("family_weekend_reflections", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  weekKey: varchar("week_key", { length: 10 }).notNull(),
  goodThing: varchar("good_thing", { length: 280 }).notNull(),
  nextHope: varchar("next_hope", { length: 280 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_weekend_reflections_group_week_idx").on(table.familyGroupId, table.weekKey)]);
export type FamilyWeekendReflection = typeof familyWeekendReflections.$inferSelect;

/** Gentle, family-visible reminders designed to support rather than pressure. */
export const familyGentleReminders = mysqlTable("family_gentle_reminders", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  note: varchar("note", { length: 240 }),
  dueAt: timestamp("due_at"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_gentle_reminders_group_completed_idx").on(table.familyGroupId, table.isCompleted)]);
export type FamilyGentleReminder = typeof familyGentleReminders.$inferSelect;

/** A low-pressure nightly note for sharing a feeling or a small sense of relief before sleep. */
export const familyEveningNotes = mysqlTable("family_evening_notes", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  mood: mysqlEnum("mood", ["calm", "tired", "happy", "anxious", "grateful"]).notNull(),
  note: varchar("note", { length: 180 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_evening_notes_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyEveningNote = typeof familyEveningNotes.$inferSelect;

/** A memory-oriented walking log for keeping the route, a found spot, and a shared detail. */
export const familyWalkLogs = mysqlTable("family_walk_logs", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  routeTitle: varchar("route_title", { length: 160 }).notNull(),
  spotName: varchar("spot_name", { length: 160 }),
  memo: varchar("memo", { length: 280 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_walk_logs_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyWalkLog = typeof familyWalkLogs.$inferSelect;

/** A concise record of a family member's everyday help, inviting gratitude without scoring it. */
export const familyHelpedMemos = mysqlTable("family_helped_memos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  helperNote: varchar("helper_note", { length: 280 }).notNull(),
  reaction: varchar("reaction", { length: 80 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_helped_memos_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyHelpedMemo = typeof familyHelpedMemos.$inferSelect;

/** A gentle note for a family's next day: a plan, a caring cue, or something to look forward to. */
export const familyTomorrowMemos = mysqlTable("family_tomorrow_memos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  targetDate: timestamp("target_date").notNull(),
  kind: mysqlEnum("kind", ["plan", "care", "fun"]).notNull(),
  note: varchar("note", { length: 280 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_tomorrow_memos_group_target_idx").on(table.familyGroupId, table.targetDate)]);
export type FamilyTomorrowMemo = typeof familyTomorrowMemos.$inferSelect;

/** A seasonal photo theme proposed by a family member to make shared memory collection playful. */
export const familySeasonalPhotoPrompts = mysqlTable("family_seasonal_photo_prompts", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  monthKey: varchar("month_key", { length: 7 }).notNull(),
  theme: varchar("theme", { length: 160 }).notNull(),
  detail: varchar("detail", { length: 240 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_seasonal_photo_prompts_group_month_idx").on(table.familyGroupId, table.monthKey)]);
export type FamilySeasonalPhotoPrompt = typeof familySeasonalPhotoPrompts.$inferSelect;

/** A family-authored how-to guide for everyday household, device, and wellbeing questions. */
export const familyHelpGuides = mysqlTable("family_help_guides", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  category: mysqlEnum("category", ["housework", "device", "health", "other"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  steps: varchar("steps", { length: 600 }).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_help_guides_group_pinned_idx").on(table.familyGroupId, table.isPinned)]);
export type FamilyHelpGuide = typeof familyHelpGuides.$inferSelect;

/** A small, voluntary family promise for the current week, with a low-pressure completion state. */
export const familyWeeklyPromises = mysqlTable("family_weekly_promises", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  weekKey: varchar("week_key", { length: 10 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  note: varchar("note", { length: 240 }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_weekly_promises_group_week_idx").on(table.familyGroupId, table.weekKey)]);
export type FamilyWeeklyPromise = typeof familyWeeklyPromises.$inferSelect;

/** A voluntary signal that helps family members choose a respectful time to start a conversation. */
export const familyTalkTimings = mysqlTable("family_talk_timings", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  state: mysqlEnum("state", ["available", "later", "quiet"]).notNull(),
  note: varchar("note", { length: 160 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_talk_timings_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyTalkTiming = typeof familyTalkTimings.$inferSelect;

/** A short note that gives a family photo or post a rereadable personal reason. */
export const familyMemoryBookmarks = mysqlTable("family_memory_bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  sourceType: mysqlEnum("source_type", ["photo", "post", "other"]).notNull(),
  sourceLabel: varchar("source_label", { length: 160 }).notNull(),
  reason: varchar("reason", { length: 280 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_memory_bookmarks_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyMemoryBookmark = typeof familyMemoryBookmarks.$inferSelect;

/** A family question box entry that can be shared with a softly anonymous sender identity. */
export const familyQuestionBoxEntries = mysqlTable("family_question_box_entries", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  question: varchar("question", { length: 280 }).notNull(),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  isOpened: boolean("is_opened").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_question_box_entries_group_opened_idx").on(table.familyGroupId, table.isOpened)]);
export type FamilyQuestionBoxEntry = typeof familyQuestionBoxEntries.$inferSelect;

/** A concise morning encouragement created before a family member starts their day. */
export const familyMorningEncouragements = mysqlTable("family_morning_encouragements", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  message: varchar("message", { length: 180 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_morning_encouragements_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyMorningEncouragement = typeof familyMorningEncouragements.$inferSelect;

/** A lightweight weekend reunion plan that shares a return or gathering time with optional context. */
export const familyWeekendHomecomingPlans = mysqlTable("family_weekend_homecoming_plans", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  plannedAt: timestamp("planned_at").notNull(),
  meetingPlace: varchar("meeting_place", { length: 160 }),
  note: varchar("note", { length: 240 }),
  isConfirmed: boolean("is_confirmed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_weekend_homecoming_plans_group_planned_idx").on(table.familyGroupId, table.plannedAt)]);
export type FamilyWeekendHomecomingPlan = typeof familyWeekendHomecomingPlans.$inferSelect;

/** An open invitation to do a small chore or hobby together as a family. */
export const familyTogetherInvitations = mysqlTable("family_together_invitations", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  kind: mysqlEnum("kind", ["chore", "hobby", "other"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  note: varchar("note", { length: 240 }),
  isClosed: boolean("is_closed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_together_invitations_group_closed_idx").on(table.familyGroupId, table.isClosed)]);
export type FamilyTogetherInvitation = typeof familyTogetherInvitations.$inferSelect;

/** A single participant response to a family together invitation. */
export const familyTogetherResponses = mysqlTable("family_together_responses", {
  id: int("id").autoincrement().primaryKey(),
  invitationId: int("invitation_id").notNull(),
  userId: int("user_id").notNull(),
  response: mysqlEnum("response", ["join", "maybe"]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_together_responses_invitation_idx").on(table.invitationId)]);
export type FamilyTogetherResponse = typeof familyTogetherResponses.$inferSelect;

/** A color-based wellbeing and comfort signal that avoids reducing a family member to a numeric score. */
export const familyComfortMeters = mysqlTable("family_comfort_meters", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  color: mysqlEnum("color", ["sunny", "soft", "cloudy", "rainy"]).notNull(),
  message: varchar("message", { length: 160 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_comfort_meters_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyComfortMeter = typeof familyComfortMeters.$inferSelect;

/** A family-contributed indoor idea for rain or other stay-at-home days. */
export const familyRainyDayIdeas = mysqlTable("family_rainy_day_ideas", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  detail: varchar("detail", { length: 240 }),
  mood: mysqlEnum("mood", ["quiet", "creative", "active"]).notNull(),
  isTried: boolean("is_tried").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_rainy_day_ideas_group_tried_idx").on(table.familyGroupId, table.isTried)]);
export type FamilyRainyDayIdea = typeof familyRainyDayIdeas.$inferSelect;

/** A small, same-day thing a family member is looking forward to and can invite kind conversation around. */
export const familyDailyJoys = mysqlTable("family_daily_joys", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  dayKey: varchar("day_key", { length: 10 }).notNull(),
  joy: varchar("joy", { length: 180 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_daily_joys_group_day_idx").on(table.familyGroupId, table.dayKey)]);
export type FamilyDailyJoy = typeof familyDailyJoys.$inferSelect;

/** A gentle request to hear a family member's story later, without demanding an immediate response. */
export const familyLaterListenMemos = mysqlTable("family_later_listen_memos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  note: varchar("note", { length: 240 }),
  isFollowedUp: boolean("is_followed_up").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_later_listen_group_followed_idx").on(table.familyGroupId, table.isFollowedUp)]);
export type FamilyLaterListenMemo = typeof familyLaterListenMemos.$inferSelect;

/** A light topic that can be brought to a shared meal without pressure to perform. */
export const familyTableTopics = mysqlTable("family_table_topics", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  tone: mysqlEnum("tone", ["laugh", "share", "think"]).notNull(),
  topic: varchar("topic", { length: 180 }).notNull(),
  isDiscussed: boolean("is_discussed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_table_topics_group_discussed_idx").on(table.familyGroupId, table.isDiscussed)]);
export type FamilyTableTopic = typeof familyTableTopics.$inferSelect;

/** An optional clue that helps a family find each other at a meeting point with less stress. */
export const familyMeetingMarkers = mysqlTable("family_meeting_markers", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  locationHint: varchar("location_hint", { length: 160 }).notNull(),
  appearanceHint: varchar("appearance_hint", { length: 160 }),
  note: varchar("note", { length: 180 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_meeting_markers_group_active_idx").on(table.familyGroupId, table.isActive)]);
export type FamilyMeetingMarker = typeof familyMeetingMarkers.$inferSelect;

/** A small reset idea that a family member can share and mark when it helped. */
export const familyMoodResetIdeas = mysqlTable("family_mood_reset_ideas", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  kind: mysqlEnum("kind", ["breath", "music", "move", "rest"]).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  isTried: boolean("is_tried").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_mood_reset_ideas_group_tried_idx").on(table.familyGroupId, table.isTried)]);
export type FamilyMoodResetIdea = typeof familyMoodResetIdeas.$inferSelect;

/** A short gratitude relay passed among family members and acknowledged by a gentle mark. */
export const familyThanksRelays = mysqlTable("family_thanks_relays", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  recipientHint: varchar("recipient_hint", { length: 80 }),
  message: varchar("message", { length: 180 }).notNull(),
  isReceived: boolean("is_received").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_thanks_relays_group_received_idx").on(table.familyGroupId, table.isReceived)]);
export type FamilyThanksRelay = typeof familyThanksRelays.$inferSelect;

/** A concise item, caution, or cheer to check before a family member goes out. */
export const familyOutingCharmMemos = mysqlTable("family_outing_charm_memos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  kind: mysqlEnum("kind", ["item", "caution", "cheer"]).notNull(),
  memo: varchar("memo", { length: 180 }).notNull(),
  isChecked: boolean("is_checked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_outing_charm_memos_group_checked_idx").on(table.familyGroupId, table.isChecked)]);
export type FamilyOutingCharmMemo = typeof familyOutingCharmMemos.$inferSelect;

/** A gentle phrase a family chooses together for the current week. */
export const familyWeeklyCheerThemes = mysqlTable("family_weekly_cheer_themes", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  weekKey: varchar("week_key", { length: 10 }).notNull(),
  theme: varchar("theme", { length: 120 }).notNull(),
  support: varchar("support", { length: 180 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_weekly_cheer_group_week_idx").on(table.familyGroupId, table.weekKey)]);
export type FamilyWeeklyCheerTheme = typeof familyWeeklyCheerThemes.$inferSelect;

/** A low-stakes badge for noticing an everyday achievement rather than scoring a person. */
export const familyTinyAchievementBadges = mysqlTable("family_tiny_achievement_badges", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  kind: mysqlEnum("kind", ["kindness", "effort", "bravery", "care"]).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  isCelebrated: boolean("is_celebrated").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_tiny_badges_group_celebrated_idx").on(table.familyGroupId, table.isCelebrated)]);
export type FamilyTinyAchievementBadge = typeof familyTinyAchievementBadges.$inferSelect;

/** A one-step preparation memo that helps tomorrow morning start with less rush. */
export const familyBedtimePreparationMemos = mysqlTable("family_bedtime_preparation_memos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  kind: mysqlEnum("kind", ["bag", "clothes", "plan", "care"]).notNull(),
  memo: varchar("memo", { length: 180 }).notNull(),
  isPrepared: boolean("is_prepared").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_bedtime_prep_group_prepared_idx").on(table.familyGroupId, table.isPrepared)]);
export type FamilyBedtimePreparationMemo = typeof familyBedtimePreparationMemos.$inferSelect;

/** A non-clinical wellbeing note that shares only the support a family member wants right now. */
export const familyWellbeingNotes = mysqlTable("family_wellbeing_notes", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  state: mysqlEnum("state", ["good", "slow", "tired", "need_space"]).notNull(),
  supportNeed: varchar("support_need", { length: 180 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_wellbeing_notes_group_created_idx").on(table.familyGroupId, table.createdAt)]);
export type FamilyWellbeingNote = typeof familyWellbeingNotes.$inferSelect;

/** A small joy that the family would like to try during a specific month. */
export const familyMonthlyJoyBoxes = mysqlTable("family_monthly_joy_boxes", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  monthKey: varchar("month_key", { length: 7 }).notNull(),
  joy: varchar("joy", { length: 180 }).notNull(),
  isRealized: boolean("is_realized").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_monthly_joy_group_month_idx").on(table.familyGroupId, table.monthKey)]);
export type FamilyMonthlyJoyBox = typeof familyMonthlyJoyBoxes.$inferSelect;

/** A memorable good thing from ordinary life that can be revisited together. */
export const familyGoodFindMemos = mysqlTable("family_good_find_memos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  goodThing: varchar("good_thing", { length: 240 }).notNull(),
  tag: varchar("tag", { length: 80 }),
  isSaved: boolean("is_saved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_good_find_group_saved_idx").on(table.familyGroupId, table.isSaved)]);
export type FamilyGoodFindMemo = typeof familyGoodFindMemos.$inferSelect;

/** A small statement of intention shared near the beginning of a week. */
export const familyWeekStartDeclarations = mysqlTable("family_week_start_declarations", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  weekKey: varchar("week_key", { length: 10 }).notNull(),
  declaration: varchar("declaration", { length: 180 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_week_start_group_week_idx").on(table.familyGroupId, table.weekKey)]);
export type FamilyWeekStartDeclaration = typeof familyWeekStartDeclarations.$inferSelect;

/** A reassuring moment that a family member wants to preserve from the day. */
export const familyCalmMoments = mysqlTable("family_calm_moments", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  moment: varchar("moment", { length: 240 }).notNull(),
  isKept: boolean("is_kept").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_calm_moments_group_kept_idx").on(table.familyGroupId, table.isKept)]);
export type FamilyCalmMoment = typeof familyCalmMoments.$inferSelect;

/** A handoff for a small task that will make the next day easier. */
export const familyTomorrowPreparationRelays = mysqlTable("family_tomorrow_preparation_relays", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  preparation: varchar("preparation", { length: 180 }).notNull(),
  relayNote: varchar("relay_note", { length: 180 }),
  isReady: boolean("is_ready").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_tomorrow_relay_group_ready_idx").on(table.familyGroupId, table.isReady)]);
export type FamilyTomorrowPreparationRelay = typeof familyTomorrowPreparationRelays.$inferSelect;

/** A compact, practical nudge that may help a family member when they are stuck. */
export const familyHelpingHands = mysqlTable("family_helping_hands", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  situation: varchar("situation", { length: 160 }).notNull(),
  smallAction: varchar("small_action", { length: 240 }).notNull(),
  isHelpful: boolean("is_helpful").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_helping_hands_group_helpful_idx").on(table.familyGroupId, table.isHelpful)]);
export type FamilyHelpingHand = typeof familyHelpingHands.$inferSelect;

/** A short everyday discovery that can prompt a family conversation. */
export const familyDiscoveryShares = mysqlTable("family_discovery_shares", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  discovery: varchar("discovery", { length: 240 }).notNull(),
  sourceHint: varchar("source_hint", { length: 120 }),
  isSaved: boolean("is_saved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_discovery_shares_group_saved_idx").on(table.familyGroupId, table.isSaved)]);
export type FamilyDiscoveryShare = typeof familyDiscoveryShares.$inferSelect;

/** A soft plan for rest or a mood reset during an upcoming weekend. */
export const familyWeekendCalmPlans = mysqlTable("family_weekend_calm_plans", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  plan: varchar("plan", { length: 180 }).notNull(),
  timingHint: varchar("timing_hint", { length: 120 }),
  isEnjoyed: boolean("is_enjoyed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_weekend_calm_group_enjoyed_idx").on(table.familyGroupId, table.isEnjoyed)]);
export type FamilyWeekendCalmPlan = typeof familyWeekendCalmPlans.$inferSelect;

/** A gentle weekly intention for the small care a family wants to offer each other. */
export const familyWeeklyCareThemes = mysqlTable("family_weekly_care_themes", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  weekKey: varchar("week_key", { length: 10 }).notNull(),
  theme: varchar("theme", { length: 140 }).notNull(),
  careHint: varchar("care_hint", { length: 200 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_weekly_care_themes_group_week_idx").on(table.familyGroupId, table.weekKey)]);
export type FamilyWeeklyCareTheme = typeof familyWeeklyCareThemes.$inferSelect;

/** A brief reflection after someone tries a small new action or idea. */
export const familyTriedMemos = mysqlTable("family_tried_memos", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  triedThing: varchar("tried_thing", { length: 180 }).notNull(),
  reflection: varchar("reflection", { length: 240 }),
  isKept: boolean("is_kept").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_tried_memos_group_kept_idx").on(table.familyGroupId, table.isKept)]);
export type FamilyTriedMemo = typeof familyTriedMemos.$inferSelect;

/** A small rest or enjoyment choice a family member wants after getting home. */
export const familyHomecomingBreathers = mysqlTable("family_homecoming_breathers", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  breather: varchar("breather", { length: 180 }).notNull(),
  note: varchar("note", { length: 180 }),
  isTaken: boolean("is_taken").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_homecoming_breathers_group_taken_idx").on(table.familyGroupId, table.isTaken)]);
export type FamilyHomecomingBreather = typeof familyHomecomingBreathers.$inferSelect;

/** One-line daily notes that let family members build a shared journal relay. */
export const familyJournalRelayEntries = mysqlTable("family_journal_relay_entries", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  dailyKey: varchar("daily_key", { length: 10 }).notNull(),
  entry: varchar("entry", { length: 220 }).notNull(),
  isPassed: boolean("is_passed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_journal_relay_entries_group_day_idx").on(table.familyGroupId, table.dailyKey)]);
export type FamilyJournalRelayEntry = typeof familyJournalRelayEntries.$inferSelect;

/** Conversation-starting topics that family members want to share and revisit. */
export const familyConversationTopics = mysqlTable("family_conversation_topics", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  topic: varchar("topic", { length: 180 }).notNull(),
  note: varchar("note", { length: 240 }),
  isDiscussed: boolean("is_discussed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_conversation_topics_group_discussed_idx").on(table.familyGroupId, table.isDiscussed)]);
export type FamilyConversationTopic = typeof familyConversationTopics.$inferSelect;

/** A short, private-in-family acknowledgement for a member's effort. */
export const familyAppreciationCards = mysqlTable("family_appreciation_cards", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  recipientName: varchar("recipient_name", { length: 80 }).notNull(),
  message: varchar("message", { length: 220 }).notNull(),
  isSeen: boolean("is_seen").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [index("family_appreciation_cards_group_seen_idx").on(table.familyGroupId, table.isSeen)]);
export type FamilyAppreciationCard = typeof familyAppreciationCards.$inferSelect;

/**
 * Location history - GPS tracking for safety
 */
export const locationHistory = mysqlTable("location_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  familyGroupId: int("family_group_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: int("accuracy"),
  locationName: varchar("location_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LocationHistory = typeof locationHistory.$inferSelect;
export type InsertLocationHistory = typeof locationHistory.$inferInsert;

/**
 * Geofences - safe zones for location-based notifications
 */
export const geofences = mysqlTable("geofences", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  radiusMeters: int("radius_meters").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Geofence = typeof geofences.$inferSelect;
export type InsertGeofence = typeof geofences.$inferInsert;

/**
 * Family preferences - AI suggestions and settings
 */
export const familyPreferences = mysqlTable("family_preferences", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  preferences: json("preferences"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FamilyPreferences = typeof familyPreferences.$inferSelect;
export type InsertFamilyPreferences = typeof familyPreferences.$inferInsert;

/**
 * Push subscriptions - web push endpoint data by user
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * In-app notifications - quiet, role-aware family updates
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  familyGroupId: int("family_group_id").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  payload: json("payload"),
  quiet: boolean("quiet").default(true).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Family schedule events - confirmed events created by family members or AI proposals
 */
export const familyScheduleEvents = mysqlTable("family_schedule_events", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FamilyScheduleEvent = typeof familyScheduleEvents.$inferSelect;
export type InsertFamilyScheduleEvent = typeof familyScheduleEvents.$inferInsert;

/**
   * Role-based notification settings for quiet notifications, vibration, sound, and visual banner
   */
export const notificationSettings = mysqlTable("notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  familyGroupId: int("family_group_id").notNull(),
  memberRole: mysqlEnum("member_role", ["guardian", "child", "elderly"]).default("guardian").notNull(),
  vibrationEnabled: boolean("vibration_enabled").default(true).notNull(),
  soundEnabled: boolean("sound_enabled").default(false).notNull(),
  bannerEnabled: boolean("banner_enabled").default(true).notNull(),
  quietMode: boolean("quiet_mode").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type NotificationSetting = typeof notificationSettings.$inferSelect;
export type InsertNotificationSetting = typeof notificationSettings.$inferInsert;


/**
 * Geofence alert state - deduplication, acknowledgement, and re-notification state
 */
export const geofenceAlertStates = mysqlTable("geofence_alert_states", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  geofenceId: int("geofence_id").notNull(),
  state: mysqlEnum("state", ["inside", "outside"]).default("inside").notNull(),
  lastDistanceMeters: int("last_distance_meters").notNull(),
  lastNotifiedAt: timestamp("last_notified_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type GeofenceAlertState = typeof geofenceAlertStates.$inferSelect;
export type InsertGeofenceAlertState = typeof geofenceAlertStates.$inferInsert;

/**
 * Weekly AI photo journal schedule - Heartbeat task ownership and user preferences
 */
export const photoJournalSchedules = mysqlTable("photo_journal_schedules", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
  enabled: boolean("enabled").default(false).notNull(),
  weekday: int("weekday").default(0).notNull(),
  hour: int("hour").default(9).notNull(),
  minute: int("minute").default(0).notNull(),
  lastGeneratedAt: timestamp("last_generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  scheduleTaskUidIdx: index("photo_journal_schedule_task_uid_idx").on(table.scheduleCronTaskUid),
}));

export type PhotoJournalSchedule = typeof photoJournalSchedules.$inferSelect;
export type InsertPhotoJournalSchedule = typeof photoJournalSchedules.$inferInsert;

/**
 * Wearable health snapshots - explicitly simulated data for demos and testing
 */
export const wearableHealthSnapshots = mysqlTable("wearable_health_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  familyGroupId: int("family_group_id").notNull(),
  userId: int("user_id").notNull(),
  steps: int("steps").notNull(),
  heartRate: int("heart_rate").notNull(),
  sleepMinutes: int("sleep_minutes").notNull(),
  source: mysqlEnum("source", ["simulated"]).default("simulated").notNull(),
  simulatedAt: timestamp("simulated_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WearableHealthSnapshot = typeof wearableHealthSnapshots.$inferSelect;
export type InsertWearableHealthSnapshot = typeof wearableHealthSnapshots.$inferInsert;
