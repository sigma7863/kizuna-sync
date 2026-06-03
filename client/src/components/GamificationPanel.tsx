import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Star, Zap } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt: Date;
}

interface UserStats {
  points: number;
  level: number;
  totalPoints: number;
  badges: Badge[];
}

interface GamificationPanelProps {
  userId: number;
  stats?: UserStats;
}

export function GamificationPanel({ userId, stats }: GamificationPanelProps) {
  const [displayStats, setDisplayStats] = useState<UserStats>({
    points: 0,
    level: 1,
    totalPoints: 0,
    badges: [],
  });

  useEffect(() => {
    if (stats) {
      setDisplayStats(stats);
    }
  }, [stats]);

  const getNextLevelThreshold = (level: number) => {
    return level * 100;
  };

  const progressToNextLevel = Math.min(
    (displayStats.points / getNextLevelThreshold(displayStats.level)) * 100,
    100
  );

  return (
    <div className="space-y-4">
      {/* Level & Points Card */}
      <Card className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">レベル</p>
            <h3 className="text-3xl font-bold">{displayStats.level}</h3>
          </div>
          <Trophy className="w-12 h-12 opacity-80" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>ポイント</span>
            <span>
              {displayStats.points} / {getNextLevelThreshold(displayStats.level)}
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>

        {/* Total Points */}
        <div className="mt-4 pt-4 border-t border-white border-opacity-30">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">総ポイント: {displayStats.totalPoints}</span>
          </div>
        </div>
      </Card>

      {/* Badges Section */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          バッジ ({displayStats.badges.length})
        </h4>

        {displayStats.badges.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {displayStats.badges.map((badge) => (
              <Card
                key={badge.id}
                className="p-3 text-center hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="text-2xl mb-2">{badge.icon}</div>
                <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                  {badge.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(badge.earnedAt).toLocaleDateString('ja-JP')}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-center text-gray-500">
            <p className="text-sm">まだバッジを獲得していません</p>
            <p className="text-xs mt-1">アクティビティを共有してバッジを獲得しましょう！</p>
          </Card>
        )}
      </div>

      {/* Achievement Tips */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <p className="text-xs font-semibold text-blue-900 mb-2">💡 ヒント</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 毎日アクティビティを共有してポイントを獲得</li>
          <li>• 特定の条件を達成するとバッジが獲得できます</li>
          <li>• レベルアップで新しい機能がアンロック</li>
        </ul>
      </Card>
    </div>
  );
}
