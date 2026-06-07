import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { familyMembers } from "../drizzle/schema";

export interface KidModeSettings {
  userId: number;
  familyGroupId: number;
  isKidModeEnabled: boolean;
  ageGroup: "toddler" | "child" | "preteen" | "teen";
  dailyScreenTimeLimit: number; // minutes
  bedtimeStart: string; // HH:MM
  bedtimeEnd: string; // HH:MM
  allowedFeatures: string[];
  parentalControlsEnabled: boolean;
  contentFilterLevel: "strict" | "moderate" | "relaxed";
}

export interface ScreenTimeLog {
  userId: number;
  date: Date;
  totalMinutes: number;
  sessionLogs: Array<{
    startTime: Date;
    endTime: Date;
    feature: string;
  }>;
}

/**
 * 子供向けモード設定を取得
 */
export async function getKidModeSettings(
  userId: number,
  familyGroupId: number
): Promise<KidModeSettings> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const member = await db
    .select()
    .from(familyMembers)
    .where(eq(familyMembers.userId, userId))
    .limit(1);

  if (!member.length) {
    throw new Error("Member not found");
  }

  const memberRole = member[0].memberRole;

  // 子供ロールの場合のみ子供向けモードを有効化
  const isKidMode = memberRole === "child";

  return {
    userId,
    familyGroupId,
    isKidModeEnabled: isKidMode,
    ageGroup: "child",
    dailyScreenTimeLimit: 120, // 2 hours
    bedtimeStart: "21:00",
    bedtimeEnd: "07:00",
    allowedFeatures: [
      "timeline",
      "activities",
      "photos",
      "messages",
      "games",
      "achievements",
    ],
    parentalControlsEnabled: true,
    contentFilterLevel: "strict",
  };
}

/**
 * 子供向けUIの機能フィルタリング
 */
export function getFilteredFeatures(
  allFeatures: string[],
  kidModeSettings: KidModeSettings
): string[] {
  if (!kidModeSettings.isKidModeEnabled) {
    return allFeatures;
  }

  return allFeatures.filter((feature) =>
    kidModeSettings.allowedFeatures.includes(feature)
  );
}

/**
 * スクリーンタイム制限チェック
 */
export function checkScreenTimeLimit(
  log: ScreenTimeLog,
  limit: number
): { isWithinLimit: boolean; remainingMinutes: number } {
  const isWithinLimit = log.totalMinutes < limit;
  const remainingMinutes = Math.max(0, limit - log.totalMinutes);

  return {
    isWithinLimit,
    remainingMinutes,
  };
}

/**
 * 就寝時間チェック
 */
export function isBedtime(
  bedtimeStart: string,
  bedtimeEnd: string,
  currentTime: Date = new Date()
): boolean {
  const [startHour, startMin] = bedtimeStart.split(":").map(Number);
  const [endHour, endMin] = bedtimeEnd.split(":").map(Number);
  const currentHour = currentTime.getHours();
  const currentMin = currentTime.getMinutes();

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const currentMinutes = currentHour * 60 + currentMin;

  // 就寝時間が日をまたぐ場合（例：21:00-07:00）
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * 子供向けUIのシンプル化
 */
export interface SimplifiedUIConfig {
  fontSize: "large" | "normal" | "small";
  colorScheme: "bright" | "pastel" | "dark";
  navigationStyle: "icons" | "text" | "both";
  showHelpText: boolean;
  animationLevel: "high" | "medium" | "low";
}

export function getKidFriendlyUIConfig(
  ageGroup: "toddler" | "child" | "preteen" | "teen"
): SimplifiedUIConfig {
  const configs: Record<string, SimplifiedUIConfig> = {
    toddler: {
      fontSize: "large",
      colorScheme: "bright",
      navigationStyle: "icons",
      showHelpText: true,
      animationLevel: "high",
    },
    child: {
      fontSize: "large",
      colorScheme: "pastel",
      navigationStyle: "both",
      showHelpText: true,
      animationLevel: "medium",
    },
    preteen: {
      fontSize: "normal",
      colorScheme: "pastel",
      navigationStyle: "text",
      showHelpText: false,
      animationLevel: "medium",
    },
    teen: {
      fontSize: "normal",
      colorScheme: "dark",
      navigationStyle: "text",
      showHelpText: false,
      animationLevel: "low",
    },
  };

  return configs[ageGroup] || configs.child;
}

/**
 * 親の監視ダッシュボード用データ
 */
export interface ParentalDashboard {
  childId: number;
  childName: string;
  todayScreenTime: number;
  screenTimeLimit: number;
  isBedtime: boolean;
  recentActivities: Array<{
    timestamp: Date;
    activity: string;
    feature: string;
  }>;
  achievementCount: number;
  lastActiveTime: Date;
}

export function generateParentalDashboard(
  childId: number,
  childName: string,
  screenTimeLog: ScreenTimeLog,
  limit: number
): ParentalDashboard {
  return {
    childId,
    childName,
    todayScreenTime: screenTimeLog.totalMinutes,
    screenTimeLimit: limit,
    isBedtime: isBedtime("21:00", "07:00"),
    recentActivities: screenTimeLog.sessionLogs.map((session) => ({
      timestamp: session.startTime,
      activity: `Used ${session.feature}`,
      feature: session.feature,
    })),
    achievementCount: 5,
    lastActiveTime: new Date(),
  };
}
