import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, Star, Zap } from 'lucide-react';

interface Achievement {
  id: string;
  userName: string;
  routineTitle: string;
  pointsEarned: number;
  streakDays: number;
  badgesEarned: string[];
  timestamp: Date;
}

interface RoutineAchievementNotifierProps {
  familyGroupId: number;
}

const BADGE_ICONS: Record<string, string> = {
  '最初の一歩': '👣',
  '週間チャンピオン': '🔥',
  '月間マスター': '👑',
  センチュリー: '💯',
  '家族のヒーロー': '🦸',
};

export function RoutineAchievementNotifier({ familyGroupId }: RoutineAchievementNotifierProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [visibleNotification, setVisibleNotification] = useState<Achievement | null>(null);

  useEffect(() => {
    // Mock achievement notifications
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        userName: 'お母さん',
        routineTitle: '朝のヨガ',
        pointsEarned: 50,
        streakDays: 7,
        badgesEarned: ['週間チャンピオン'],
        timestamp: new Date(),
      },
      {
        id: '2',
        userName: 'お兄さん',
        routineTitle: '勉強時間',
        pointsEarned: 100,
        streakDays: 30,
        badgesEarned: ['月間マスター'],
        timestamp: new Date(Date.now() - 60000),
      },
    ];

    setAchievements(mockAchievements);

    // Show first notification
    if (mockAchievements.length > 0) {
      setVisibleNotification(mockAchievements[0]);
    }
  }, [familyGroupId]);

  const handleDismiss = () => {
    setVisibleNotification(null);
    const remaining = achievements.filter((a) => a.id !== visibleNotification?.id);
    if (remaining.length > 0) {
      setTimeout(() => {
        setVisibleNotification(remaining[0]);
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      {/* Notification Toast */}
      {visibleNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 border-0 shadow-lg overflow-hidden">
            <div className="p-4 text-white space-y-3">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 animate-bounce" />
                <div>
                  <p className="font-bold text-lg">{visibleNotification.userName}さんが達成！</p>
                  <p className="text-sm opacity-90">{visibleNotification.routineTitle}</p>
                </div>
              </div>

              <div className="bg-white/20 rounded p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    +{visibleNotification.pointsEarned} ポイント獲得
                  </span>
                </div>

                {visibleNotification.streakDays > 0 && (
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {visibleNotification.streakDays}日連続達成中！
                    </span>
                  </div>
                )}

                {visibleNotification.badgesEarned.length > 0 && (
                  <div className="space-y-1">
                    {visibleNotification.badgesEarned.map((badge) => (
                      <div key={badge} className="flex items-center gap-2">
                        <span className="text-lg">
                          {BADGE_ICONS[badge] || '🏅'}
                        </span>
                        <span className="text-sm font-semibold">{badge}を獲得！</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleDismiss}
                className="w-full bg-white text-orange-500 hover:bg-gray-100 font-semibold"
              >
                素晴らしい！
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Achievement History */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">🎯 最近の達成</h3>
        {achievements.map((achievement) => (
          <Card key={achievement.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{achievement.badgesEarned.length > 0 ? '🏆' : '⭐'}</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{achievement.userName}</p>
                <p className="text-sm text-gray-600">{achievement.routineTitle}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>+{achievement.pointsEarned}pt</span>
                  {achievement.streakDays > 0 && (
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {achievement.streakDays}日
                    </span>
                  )}
                </div>

                {achievement.badgesEarned.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {achievement.badgesEarned.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold"
                      >
                        {BADGE_ICONS[badge] || '🏅'} {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
