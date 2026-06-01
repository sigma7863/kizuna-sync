import { getDb } from './db';
import { userActivities, timelineEntries } from '../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface ActivityStats {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  topActiveMembers: Array<{ userId: number; userName: string; count: number }>;
  activityTrend: Array<{ date: string; count: number }>;
}

export interface FamilyStats {
  weeklyStats: ActivityStats;
  monthlyStats: ActivityStats;
  memberParticipation: Array<{ userId: number; userName: string; participationRate: number }>;
  mostActiveHours: Array<{ hour: number; count: number }>;
  averageActivityPerDay: number;
}

export async function getWeeklyStats(familyGroupId: number): Promise<ActivityStats> {
  const db = await getDb();
  if (!db) return { totalActivities: 0, activitiesByType: {}, topActiveMembers: [], activityTrend: [] };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // アクティビティを取得
  const activities = await db
    .select()
    .from(userActivities)
    .where(
      and(
        eq(userActivities.familyGroupId, familyGroupId),
        gte(userActivities.createdAt, sevenDaysAgo)
      )
    );

  // 統計を計算
  const activitiesByType: Record<string, number> = {};
  const memberActivities: Record<number, { count: number; name: string }> = {};
  const dailyTrend: Record<string, number> = {};

  activities.forEach((activity) => {
    // アクティビティタイプ別集計
    activitiesByType[activity.activityType] = (activitiesByType[activity.activityType] || 0) + 1;

    // メンバー別集計
    if (!memberActivities[activity.userId]) {
      memberActivities[activity.userId] = { count: 0, name: `User ${activity.userId}` };
    }
    memberActivities[activity.userId].count++;

    // 日別トレンド
    const date = activity.createdAt.toISOString().split('T')[0];
    dailyTrend[date] = (dailyTrend[date] || 0) + 1;
  });

  // トップアクティブメンバーを取得
  const topActiveMembers = Object.entries(memberActivities)
    .map(([userId, data]) => ({
      userId: parseInt(userId),
      userName: data.name,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // アクティビティトレンドを取得
  const activityTrend = Object.entries(dailyTrend)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    totalActivities: activities.length,
    activitiesByType,
    topActiveMembers,
    activityTrend,
  };
}

export async function getMonthlyStats(familyGroupId: number): Promise<ActivityStats> {
  const db = await getDb();
  if (!db) return { totalActivities: 0, activitiesByType: {}, topActiveMembers: [], activityTrend: [] };

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // アクティビティを取得
  const activities = await db
    .select()
    .from(userActivities)
    .where(
      and(
        eq(userActivities.familyGroupId, familyGroupId),
        gte(userActivities.createdAt, thirtyDaysAgo)
      )
    );

  // 統計を計算
  const activitiesByType: Record<string, number> = {};
  const memberActivities: Record<number, { count: number; name: string }> = {};
  const weeklyTrend: Record<string, number> = {};

  activities.forEach((activity) => {
    // アクティビティタイプ別集計
    activitiesByType[activity.activityType] = (activitiesByType[activity.activityType] || 0) + 1;

    // メンバー別集計
    if (!memberActivities[activity.userId]) {
      memberActivities[activity.userId] = { count: 0, name: `User ${activity.userId}` };
    }
    memberActivities[activity.userId].count++;

    // 週別トレンド
    const weekStart = new Date(activity.createdAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    weeklyTrend[weekKey] = (weeklyTrend[weekKey] || 0) + 1;
  });

  // トップアクティブメンバーを取得
  const topActiveMembers = Object.entries(memberActivities)
    .map(([userId, data]) => ({
      userId: parseInt(userId),
      userName: data.name,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // アクティビティトレンドを取得
  const activityTrend = Object.entries(weeklyTrend)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    totalActivities: activities.length,
    activitiesByType,
    topActiveMembers,
    activityTrend,
  };
}

export async function getFamilyStats(familyGroupId: number): Promise<FamilyStats> {
  const weeklyStats = await getWeeklyStats(familyGroupId);
  const monthlyStats = await getMonthlyStats(familyGroupId);

  // メンバー参加率を計算
  const db = await getDb();
  if (!db) {
    return {
      weeklyStats,
      monthlyStats,
      memberParticipation: [],
      mostActiveHours: [],
      averageActivityPerDay: 0,
    };
  }

  // 最もアクティブな時間帯を取得
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentActivities = await db
    .select()
    .from(userActivities)
    .where(
      and(
        eq(userActivities.familyGroupId, familyGroupId),
        gte(userActivities.createdAt, sevenDaysAgo)
      )
    );

  const hourlyDistribution: Record<number, number> = {};
  recentActivities.forEach((activity) => {
    const hour = activity.createdAt.getHours();
    hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
  });

  const mostActiveHours = Object.entries(hourlyDistribution)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 1日あたりの平均アクティビティ
  const averageActivityPerDay = weeklyStats.totalActivities / 7;

  // メンバー参加率（簡略版）
  const memberParticipation = weeklyStats.topActiveMembers.map((member) => ({
    userId: member.userId,
    userName: member.userName,
    participationRate: (member.count / Math.max(weeklyStats.totalActivities, 1)) * 100,
  }));

  return {
    weeklyStats,
    monthlyStats,
    memberParticipation,
    mostActiveHours,
    averageActivityPerDay,
  };
}
