import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Flame, Trophy, Star, Clock, Plus } from 'lucide-react';

interface Routine {
  id: number;
  title: string;
  description: string;
  category: 'morning' | 'evening' | 'meal' | 'exercise' | 'study' | 'other';
  scheduledTime: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  pointsReward: number;
  isCompleted: boolean;
  streak: number;
  icon: string;
  userName: string;
}

interface RoutineStats {
  totalRoutines: number;
  completedToday: number;
  completionRate: number;
  totalPointsThisWeek: number;
  topRoutine: string | null;
}

interface FamilyRoutineManagerProps {
  routines?: Routine[];
  stats?: RoutineStats;
  onCompleteRoutine?: (routineId: number) => void;
  onCreateRoutine?: () => void;
}

const CATEGORY_ICONS = {
  morning: '🌅',
  evening: '🌙',
  meal: '🍽️',
  exercise: '💪',
  study: '📚',
  other: '⭐',
};

const CATEGORY_COLORS = {
  morning: 'bg-orange-100 text-orange-800',
  evening: 'bg-indigo-100 text-indigo-800',
  meal: 'bg-green-100 text-green-800',
  exercise: 'bg-red-100 text-red-800',
  study: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-800',
};

export function FamilyRoutineManager({
  routines = [],
  stats = {
    totalRoutines: 0,
    completedToday: 0,
    completionRate: 0,
    totalPointsThisWeek: 0,
    topRoutine: null,
  },
  onCompleteRoutine,
  onCreateRoutine,
}: FamilyRoutineManagerProps) {
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [showNewRoutineDialog, setShowNewRoutineDialog] = useState(false);

  return (
    <div className="w-full space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-pink-600">{stats.completedToday}</div>
          <p className="text-xs text-gray-600 mt-1">本日完了</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
          <p className="text-xs text-gray-600 mt-1">完了率</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.totalPointsThisWeek}</div>
          <p className="text-xs text-gray-600 mt-1">今週のポイント</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalRoutines}</div>
          <p className="text-xs text-gray-600 mt-1">ルーティン数</p>
        </Card>
      </div>

      {/* Create Button */}
      <Button
        onClick={() => setShowNewRoutineDialog(true)}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        新しいルーティンを追加
      </Button>

      {/* Routines by Category */}
      <div className="space-y-4">
        {Object.entries(CATEGORY_ICONS).map(([category, icon]) => {
          const categoryRoutines = routines.filter((r) => r.category === category);
          if (categoryRoutines.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                {category === 'morning'
                  ? '朝のルーティン'
                  : category === 'evening'
                    ? '夜のルーティン'
                    : category === 'meal'
                      ? '食事'
                      : category === 'exercise'
                        ? '運動'
                        : category === 'study'
                          ? '勉強'
                          : 'その他'}
              </h3>

              <div className="space-y-2">
                {categoryRoutines.map((routine) => (
                  <Card
                    key={routine.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedRoutine(routine)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={routine.isCompleted}
                        onChange={() => onCompleteRoutine?.(routine.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-semibold ${
                              routine.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}
                          >
                            {routine.title}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              CATEGORY_COLORS[routine.category as keyof typeof CATEGORY_COLORS]
                            }`}
                          >
                            {routine.userName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          {routine.scheduledTime}
                          {routine.streak > 0 && (
                            <>
                              <Flame className="w-3 h-3 text-orange-500 ml-2" />
                              {routine.streak}日連続
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-pink-600">+{routine.pointsReward}pt</div>
                        {routine.streak >= 7 && (
                          <Trophy className="w-4 h-4 text-yellow-500 mx-auto mt-1" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Routine Detail Dialog */}
      <Dialog open={!!selectedRoutine} onOpenChange={() => setSelectedRoutine(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRoutine?.title}</DialogTitle>
          </DialogHeader>
          {selectedRoutine && (
            <div className="space-y-4">
              <p className="text-gray-700">{selectedRoutine.description}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">連続達成日数</span>
                  <span className="font-bold">{selectedRoutine.streak}日</span>
                </div>
                <Progress value={(selectedRoutine.streak / 30) * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-pink-50 rounded">
                  <p className="text-gray-600">報酬ポイント</p>
                  <p className="font-bold text-pink-600">{selectedRoutine.pointsReward}pt</p>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-gray-600">頻度</p>
                  <p className="font-bold text-blue-600">
                    {selectedRoutine.frequency === 'daily'
                      ? '毎日'
                      : selectedRoutine.frequency === 'weekly'
                        ? '週1回'
                        : '月1回'}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  onCompleteRoutine?.(selectedRoutine.id);
                  setSelectedRoutine(null);
                }}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                <Star className="w-4 h-4 mr-2" />
                完了する
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
