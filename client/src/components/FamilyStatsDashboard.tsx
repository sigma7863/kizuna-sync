import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Activity, Clock } from "lucide-react";
import { useState } from "react";

interface FamilyStatsDashboardProps {
  familyGroupId: number;
}

const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function FamilyStatsDashboard({ familyGroupId }: FamilyStatsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');

  const { data: stats, isLoading } = trpc.statistics.getFamilyStats.useQuery(
    { familyGroupId },
    { refetchInterval: 60000 } // 1分ごとに更新
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-gray-500">統計データが利用できません</div>;
  }

  const currentStats = timeRange === 'weekly' ? stats.weeklyStats : stats.monthlyStats;

  // アクティビティタイプのデータを準備
  const activityTypeData = Object.entries(currentStats.activitiesByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* タイムレンジ切り替え */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange('weekly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === 'weekly'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          週間
        </button>
        <button
          onClick={() => setTimeRange('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeRange === 'monthly'
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          月間
        </button>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">総アクティビティ</p>
              <p className="text-3xl font-bold text-pink-600 mt-2">{currentStats.totalActivities}</p>
            </div>
            <Activity className="w-12 h-12 text-pink-400 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">平均/日</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.averageActivityPerDay.toFixed(1)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-400 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">アクティブメンバー</p>
              <p className="text-3xl font-bold text-cyan-600 mt-2">{currentStats.topActiveMembers.length}</p>
            </div>
            <Users className="w-12 h-12 text-cyan-400 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">ピーク時間</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {stats.mostActiveHours[0]?.hour || '-'}時
              </p>
            </div>
            <Clock className="w-12 h-12 text-amber-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* アクティビティトレンド */}
        <Card className="p-6 bg-white border-0 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">アクティビティトレンド</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentStats.activityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: '#ec4899', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* アクティビティタイプ分布 */}
        <Card className="p-6 bg-white border-0 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">アクティビティ分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={activityTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {activityTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* トップアクティブメンバー */}
      <Card className="p-6 bg-white border-0 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">トップアクティブメンバー</h3>
        <div className="space-y-3">
          {currentStats.topActiveMembers.map((member: any, index: any) => (
            <div key={member.userId} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{member.userName}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                    style={{
                      width: `${(member.count / Math.max(...currentStats.topActiveMembers.map((m: any) => m.count), 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-600">{member.count}件</p>
            </div>
          ))}
        </div>
      </Card>

      {/* メンバー参加率 */}
      <Card className="p-6 bg-white border-0 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">メンバー参加率</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.memberParticipation}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="userName" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            />
            <Bar dataKey="participationRate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
