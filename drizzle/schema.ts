import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";
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