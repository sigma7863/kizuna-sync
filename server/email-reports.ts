import { getDb } from './db';
import { eq } from 'drizzle-orm';
import { familyGroups, familyMembers, users, userActivities } from '../drizzle/schema';

export interface WeeklyReport {
  familyGroupId: number;
  familyGroupName: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalActivities: number;
  activitiesByType: Record<string, number>;
  memberStats: Array<{
    memberId: number;
    memberName: string;
    activityCount: number;
    lastActivity: Date | null;
  }>;
  topMembers: Array<{
    memberId: number;
    memberName: string;
    activityCount: number;
  }>;
}

export async function generateWeeklyReport(familyGroupId: number): Promise<WeeklyReport | null> {
  const db = await getDb();
  if (!db) return null;

  // Get family group
  const familyGroup = await db
    .select()
    .from(familyGroups)
    .where(eq(familyGroups.id, familyGroupId))
    .limit(1);

  if (!familyGroup || familyGroup.length === 0) return null;

  // Calculate week dates
  const now = new Date();
  const weekStartDate = new Date(now);
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());
  weekStartDate.setHours(0, 0, 0, 0);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 7);

  // Get family members
  const members = await db
    .select({
      id: familyMembers.id,
      userId: familyMembers.userId,
      userName: users.name,
    })
    .from(familyMembers)
    .innerJoin(users, eq(familyMembers.userId, users.id))
    .where(eq(familyMembers.familyGroupId, familyGroupId));

  // Get activities for the week (simplified query without complex date filtering)
  const allActivities = await db
    .select()
    .from(userActivities);

  const activities = allActivities.filter((activity) => {
    const actDate = activity.createdAt instanceof Date ? activity.createdAt : new Date(activity.createdAt);
    return actDate >= weekStartDate && actDate <= weekEndDate;
  });

  // Calculate statistics
  const activitiesByType: Record<string, number> = {};
  const memberStats: Record<number, { count: number; lastActivity: Date | null }> = {};

  members.forEach((member) => {
    memberStats[member.userId] = { count: 0, lastActivity: null };
  });

  activities.forEach((activity) => {
    activitiesByType[activity.activityType] = (activitiesByType[activity.activityType] || 0) + 1;
    if (memberStats[activity.userId]) {
      memberStats[activity.userId].count++;
      const activityDate = activity.createdAt instanceof Date ? activity.createdAt : new Date(activity.createdAt);
      const lastActivityDate = memberStats[activity.userId].lastActivity;
      if (!lastActivityDate || activityDate > lastActivityDate) {
        memberStats[activity.userId].lastActivity = activityDate;
      }
    }
  });

  const memberStatsArray = members.map((member) => ({
    memberId: member.userId,
    memberName: member.userName || 'Unknown',
    activityCount: memberStats[member.userId]?.count || 0,
    lastActivity: memberStats[member.userId]?.lastActivity || null,
  }));

  const topMembers = [...memberStatsArray]
    .sort((a, b) => b.activityCount - a.activityCount)
    .slice(0, 3);

  return {
    familyGroupId,
    familyGroupName: familyGroup[0].name,
    weekStartDate,
    weekEndDate,
    totalActivities: activities.length,
    activitiesByType,
    memberStats: memberStatsArray,
    topMembers,
  };
}

export async function sendWeeklyReportEmail(
  familyGroupId: number,
  recipientEmail: string
): Promise<boolean> {
  try {
    const report = await generateWeeklyReport(familyGroupId);
    if (!report) return false;

    // Format email content
    const emailContent = formatWeeklyReportEmail(report);

    // TODO: integrate with an actual email delivery provider/service.
    console.warn(
      `[Email Report] Email delivery not implemented; would send weekly report for ${report.familyGroupName} to ${recipientEmail}`
    );
    void emailContent;

    return false;
  } catch (error) {
    console.error('[Email Report] Error sending email:', error);
    return false;
  }
}

function formatWeeklyReportEmail(report: WeeklyReport): string {
  const weekRange = `${report.weekStartDate.toLocaleDateString('ja-JP')} - ${report.weekEndDate.toLocaleDateString('ja-JP')}`;

  let content = `
# 家族週間レポート: ${report.familyGroupName}

## 期間: ${weekRange}

### 📊 概要
- **総アクティビティ数**: ${report.totalActivities}
- **アクティブメンバー数**: ${report.memberStats.filter((m) => m.activityCount > 0).length}

### 🎯 アクティビティ内訳
${Object.entries(report.activitiesByType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

### 👥 メンバー統計
${report.memberStats
  .map(
    (member) =>
      `- **${member.memberName}**: ${member.activityCount}件のアクティビティ${
        member.lastActivity ? ` (最終: ${member.lastActivity.toLocaleString('ja-JP')})` : ''
      }`
  )
  .join('\n')}

### 🏆 トップメンバー
${report.topMembers.map((member, i) => `${i + 1}. **${member.memberName}** - ${member.activityCount}件`).join('\n')}

---
このレポートは毎週月曜日に自動送信されます。
  `;

  return content;
}
