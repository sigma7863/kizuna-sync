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
