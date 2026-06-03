import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { int, mysqlTable, varchar, timestamp, text } from 'drizzle-orm/mysql-core';

// User achievements/badges
export const userAchievements = mysqlTable('user_achievements', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  badgeId: varchar('badgeId', { length: 64 }).notNull(),
  badgeName: varchar('badgeName', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 255 }),
  earnedAt: timestamp('earnedAt').defaultNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// User points/rewards
export const userPoints = mysqlTable('user_points', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  familyGroupId: int('familyGroupId').notNull(),
  points: int('points').default(0).notNull(),
  level: int('level').default(1).notNull(),
  totalPoints: int('totalPoints').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const BADGES = {
  FIRST_ACTIVITY: {
    id: 'first_activity',
    name: '最初のアクティビティ',
    description: '初めてアクティビティを共有した',
    icon: '🎯',
    points: 10,
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: '週間戦士',
    description: '1週間毎日アクティビティを共有した',
    icon: '⚔️',
    points: 50,
  },
  PHOTO_MASTER: {
    id: 'photo_master',
    name: '写真マスター',
    description: '10枚の写真を共有した',
    icon: '📸',
    points: 30,
  },
  VOICE_HERO: {
    id: 'voice_hero',
    name: 'ボイスヒーロー',
    description: '5つの音声メッセージを送信した',
    icon: '🎤',
    points: 25,
  },
  FAMILY_CONNECTOR: {
    id: 'family_connector',
    name: '家族コネクター',
    description: '家族全員と相互作用した',
    icon: '🤝',
    points: 100,
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: '早起き鳥',
    description: '朝6時前にアクティビティを共有した',
    icon: '🌅',
    points: 15,
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: '夜行性',
    description: '夜10時以降にアクティビティを共有した',
    icon: '🌙',
    points: 15,
  },
};

export async function awardPoints(
  userId: number,
  familyGroupId: number,
  points: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const existing = await db
    .select()
    .from(userPoints)
    .where(eq(userPoints.userId, userId));

  if (existing.length > 0) {
    await db
      .update(userPoints)
      .set({
        points: existing[0].points + points,
        totalPoints: existing[0].totalPoints + points,
      })
      .where(eq(userPoints.userId, userId));
  } else {
    await db.insert(userPoints).values({
      userId,
      familyGroupId,
      points,
      totalPoints: points,
    });
  }
}

export async function awardBadge(
  userId: number,
  badgeId: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const badge = Object.values(BADGES).find((b) => b.id === badgeId);
  if (!badge) throw new Error('Badge not found');

  // Check if user already has this badge
  const existing = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  if (existing.some((a) => a.badgeId === badgeId)) {
    return; // Already has this badge
  }

  await db.insert(userAchievements).values({
    userId,
    badgeId,
    badgeName: badge.name,
    description: badge.description,
    icon: badge.icon,
  });

  // Award points for badge
  await awardPoints(userId, 0, badge.points);
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const pointsData = await db
    .select()
    .from(userPoints)
    .where(eq(userPoints.userId, userId))
    .limit(1);

  const badges = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  return {
    points: pointsData.length > 0 ? pointsData[0].points : 0,
    level: pointsData.length > 0 ? pointsData[0].level : 1,
    totalPoints: pointsData.length > 0 ? pointsData[0].totalPoints : 0,
    badges: badges.map((b) => ({
      id: b.badgeId,
      name: b.badgeName,
      icon: b.icon,
      earnedAt: b.earnedAt,
    })),
  };
}
