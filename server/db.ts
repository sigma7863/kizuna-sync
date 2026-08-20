import { and, desc, eq, gte, lte } from "drizzle-orm";
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
