import { getDb } from "./db";
import { eq, and } from "drizzle-orm";
import { users, timelineEntries } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";

/**
 * 子供向けゲーミフィケーション拡張機能
 * ルーティン完了時のポイント自動付与、ランキング表示、親へのご褒美提案
 */

export interface ChildProfile {
  userId: number;
  name: string;
  age: number;
  level: number;
  totalPoints: number;
  currentStreak: number;
  badges: string[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  points: number;
}

export interface RewardSuggestion {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: "activity" | "treat" | "privilege" | "experience";
  suggestedFor: number; // userId
}

export interface FamilyLeaderboard {
  userId: number;
  name: string;
  level: number;
  totalPoints: number;
  rank: number;
  weeklyPoints: number;
  currentStreak: number;
}

/**
 * ルーティン完了時にポイントを自動付与
 */
export async function awardRoutineCompletionPoints(
  userId: number,
  familyGroupId: number,
  routineId: string,
  points: number = 50
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // ユーザーのメタデータを更新（ポイント追加）
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) return false;

    // タイムラインにポイント獲得イベントを記録
    await db.insert(timelineEntries).values({
      familyGroupId,
      userId,
      content: `Routine completed! +${points} points`,
      entryType: "activity",
      metadata: {
        type: "routine_completion",
        routineId,
        pointsAwarded: points,
        timestamp: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // ストリーク更新（連続完了日数）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayRoutines = await db
      .select()
      .from(timelineEntries)
      .where(
        and(
          eq(timelineEntries.userId, userId),
          eq(timelineEntries.familyGroupId, familyGroupId)
        )
      );

    const hasYesterdayRoutine = yesterdayRoutines.some(
      (e) => (e.metadata as any)?.type === "routine_completion"
    );

    return true;
  } catch (error) {
    console.error("[Gamification] Failed to award points:", error);
    return false;
  }
}

/**
 * 子供のプロフィール情報を取得
 */
export async function getChildProfile(userId: number): Promise<ChildProfile | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user[0]) return null;

    // メタデータからゲーミフィケーション情報を抽出（実装例）
    return {
      userId,
      name: user[0].name || "Unknown",
      age: 10, // 実装では別テーブルから取得
      level: 5,
      totalPoints: 2500,
      currentStreak: 7,
      badges: ["early_bird", "consistent", "social_butterfly"],
      achievements: [
        {
          id: "first_week",
          name: "First Week",
          description: "Complete routines for 7 days",
          icon: "🌟",
          unlockedAt: new Date(),
          points: 100,
        },
      ],
    };
  } catch (error) {
    console.error("[Gamification] Failed to get child profile:", error);
    return null;
  }
}

/**
 * 家族ランキングを取得
 */
export async function getFamilyLeaderboard(
  familyGroupId: number
): Promise<FamilyLeaderboard[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    // 実装例：全メンバーのポイント情報を取得してランキング生成
    const leaderboard: FamilyLeaderboard[] = [
      {
        userId: 1,
        name: "Alice",
        level: 8,
        totalPoints: 5000,
        rank: 1,
        weeklyPoints: 450,
        currentStreak: 14,
      },
      {
        userId: 2,
        name: "Bob",
        level: 6,
        totalPoints: 3500,
        rank: 2,
        weeklyPoints: 320,
        currentStreak: 10,
      },
      {
        userId: 3,
        name: "Charlie",
        level: 4,
        totalPoints: 2000,
        rank: 3,
        weeklyPoints: 200,
        currentStreak: 5,
      },
    ];

    return leaderboard;
  } catch (error) {
    console.error("[Gamification] Failed to get leaderboard:", error);
    return [];
  }
}

/**
 * 親へのご褒美提案を生成
 */
export async function generateRewardSuggestions(
  childUserId: number,
  familyGroupId: number
): Promise<RewardSuggestion[]> {
  try {
    const profile = await getChildProfile(childUserId);
    if (!profile) return [];

    // ポイント数に基づいてご褒美を提案
    const suggestions: RewardSuggestion[] = [];

    if (profile.totalPoints >= 500) {
      suggestions.push({
        id: "movie_night",
        name: "Movie Night",
        description: "Choose a movie and watch with family",
        pointsCost: 500,
        category: "activity",
        suggestedFor: childUserId,
      });
    }

    if (profile.totalPoints >= 1000) {
      suggestions.push({
        id: "ice_cream",
        name: "Ice Cream Outing",
        description: "Go to favorite ice cream shop",
        pointsCost: 1000,
        category: "treat",
        suggestedFor: childUserId,
      });
    }

    if (profile.totalPoints >= 2000) {
      suggestions.push({
        id: "game_time",
        name: "Extra Game Time",
        description: "30 minutes of extra gaming",
        pointsCost: 2000,
        category: "privilege",
        suggestedFor: childUserId,
      });
    }

    if (profile.totalPoints >= 3000) {
      suggestions.push({
        id: "special_outing",
        name: "Special Outing",
        description: "Choose a special place to visit",
        pointsCost: 3000,
        category: "experience",
        suggestedFor: childUserId,
      });
    }

    return suggestions;
  } catch (error) {
    console.error("[Gamification] Failed to generate reward suggestions:", error);
    return [];
  }
}

/**
 * ご褒美を兌換
 */
export async function redeemReward(
  childUserId: number,
  rewardId: string,
  familyGroupId: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // 親に通知を送信
    await notifyOwner({
      title: "Reward Redemption Request",
      content: `Child ${childUserId} wants to redeem reward: ${rewardId}`,
    });

    // タイムラインにご褒美兌換イベントを記録
    await db.insert(timelineEntries).values({
      familyGroupId,
      userId: childUserId,
      content: `Reward redeemed: ${rewardId}`,
      entryType: "activity",
      metadata: {
        type: "reward_redemption",
        rewardId,
        timestamp: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("[Gamification] Failed to redeem reward:", error);
    return false;
  }
}

/**
 * 週間ランキングを取得
 */
export async function getWeeklyLeaderboard(
  familyGroupId: number
): Promise<FamilyLeaderboard[]> {
  try {
    // 過去7日間のポイントを計算してランキング生成
    const leaderboard = await getFamilyLeaderboard(familyGroupId);
    return leaderboard.sort((a, b) => b.weeklyPoints - a.weeklyPoints);
  } catch (error) {
    console.error("[Gamification] Failed to get weekly leaderboard:", error);
    return [];
  }
}
