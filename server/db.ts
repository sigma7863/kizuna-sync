import { eq, desc } from "drizzle-orm";
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
} from "../drizzle/schema";
import { ENV } from './_core/env';


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
