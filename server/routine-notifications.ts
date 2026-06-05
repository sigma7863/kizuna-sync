import { notifyOwner } from './_core/notification';

export interface RoutineAchievementNotification {
  id: string;
  familyGroupId: number;
  userId: number;
  userName: string;
  routineTitle: string;
  pointsEarned: number;
  streakDays: number;
  badgesEarned: string[];
  timestamp: Date;
}

export interface RoutineBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'streak' | 'total_completions' | 'milestone';
    value: number;
  };
}

const ROUTINE_BADGES: RoutineBadge[] = [
  {
    id: 'first-step',
    name: '最初の一歩',
    description: 'ルーティンを初めて完了',
    icon: '👣',
    requirement: { type: 'total_completions', value: 1 },
  },
  {
    id: 'week-warrior',
    name: '週間チャンピオン',
    description: '7日連続でルーティンを完了',
    icon: '🔥',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'month-master',
    name: '月間マスター',
    description: '30日連続でルーティンを完了',
    icon: '👑',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'century',
    name: 'センチュリー',
    description: '100回ルーティンを完了',
    icon: '💯',
    requirement: { type: 'total_completions', value: 100 },
  },
  {
    id: 'family-hero',
    name: '家族のヒーロー',
    description: 'ルーティン完了で家族全員に50ポイント以上貢献',
    icon: '🦸',
    requirement: { type: 'milestone', value: 50 },
  },
];

export async function checkRoutineAchievements(
  familyGroupId: number,
  userId: number,
  userName: string,
  routineTitle: string,
  streakDays: number,
  totalCompletions: number,
  pointsEarned: number
): Promise<RoutineAchievementNotification> {
  const badgesEarned: string[] = [];

  // Check for badges
  ROUTINE_BADGES.forEach((badge) => {
    if (badge.requirement.type === 'streak' && streakDays === badge.requirement.value) {
      badgesEarned.push(badge.name);
    } else if (
      badge.requirement.type === 'total_completions' &&
      totalCompletions === badge.requirement.value
    ) {
      badgesEarned.push(badge.name);
    }
  });

  const notification: RoutineAchievementNotification = {
    id: `notif-${Date.now()}`,
    familyGroupId,
    userId,
    userName,
    routineTitle,
    pointsEarned,
    streakDays,
    badgesEarned,
    timestamp: new Date(),
  };

  // Send notification if badges were earned
  if (badgesEarned.length > 0) {
    await notifyOwner({
      title: `🎉 ${userName}さんが新しいバッジを獲得！`,
      content: `${routineTitle}で${badgesEarned.join('、')}を獲得しました！${pointsEarned}ポイント獲得。`,
    });
  }

  return notification;
}

export async function broadcastRoutineCompletion(
  familyGroupId: number,
  userId: number,
  userName: string,
  routineTitle: string,
  pointsEarned: number
): Promise<void> {
  // Broadcast to all family members
  const message = `${userName}さんが「${routineTitle}」を完了しました！ +${pointsEarned}ポイント`;

  // In production, this would be sent via WebSocket to all family members
  console.log(`[Routine Notification] ${message}`);
}

export async function generateRoutineMotivation(
  userName: string,
  routineTitle: string,
  streakDays: number
): Promise<string> {
  const motivations = [
    `${userName}さん、素晴らしい！${streakDays}日連続達成中です！`,
    `${routineTitle}を完了して、家族の絆が深まりました！`,
    `${userName}さんの頑張りが家族を支えています！`,
    `${streakDays}日の連続達成！このペースなら月間マスターも近い！`,
    `${routineTitle}の完了で、家族全員が幸せになりました！`,
  ];

  return motivations[Math.floor(Math.random() * motivations.length)];
}

export function getBadgeByName(name: string): RoutineBadge | undefined {
  return ROUTINE_BADGES.find((b) => b.name === name);
}

export function getAllBadges(): RoutineBadge[] {
  return ROUTINE_BADGES;
}
