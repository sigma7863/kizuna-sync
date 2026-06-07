import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Clock, Zap, Shield, Award } from "lucide-react";

interface KidModeSettings {
  isEnabled: boolean;
  ageGroup: "toddler" | "child" | "preteen" | "teen";
  dailyScreenTimeLimit: number;
  bedtimeStart: string;
  bedtimeEnd: string;
  contentFilterLevel: "strict" | "moderate" | "relaxed";
}

export default function KidModePanel() {
  const [settings, setSettings] = useState<KidModeSettings>({
    isEnabled: true,
    ageGroup: "child",
    dailyScreenTimeLimit: 120,
    bedtimeStart: "21:00",
    bedtimeEnd: "07:00",
    contentFilterLevel: "strict",
  });

  const [todayScreenTime, setTodayScreenTime] = useState(45);
  const [achievements, setAchievements] = useState([
    { id: 1, name: "初めての投稿", icon: "📝", unlocked: true },
    { id: 2, name: "7日連続ログイン", icon: "🔥", unlocked: true },
    { id: 3, name: "10個の写真共有", icon: "📸", unlocked: false },
    { id: 4, name: "家族チャット100件", icon: "💬", unlocked: false },
  ]);

  const handleScreenTimeLimitChange = (value: number[]) => {
    setSettings({ ...settings, dailyScreenTimeLimit: value[0] });
  };

  const handleBedtimeStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, bedtimeStart: e.target.value });
  };

  const handleBedtimeEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, bedtimeEnd: e.target.value });
  };

  const screenTimePercentage = (todayScreenTime / settings.dailyScreenTimeLimit) * 100;
  const screenTimeColor =
    screenTimePercentage < 50
      ? "text-green-500"
      : screenTimePercentage < 80
      ? "text-yellow-500"
      : "text-red-500";

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">子供向けモード</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">有効</span>
          <Switch checked={settings.isEnabled} />
        </div>
      </div>

      {/* 今日のスクリーンタイム */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">今日のスクリーンタイム</span>
          </div>
          <span className={`text-2xl font-bold ${screenTimeColor}`}>
            {todayScreenTime}分
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${
              screenTimePercentage < 50
                ? "bg-green-500"
                : screenTimePercentage < 80
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.min(screenTimePercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          残り時間: {Math.max(0, settings.dailyScreenTimeLimit - todayScreenTime)}分
        </p>
      </Card>

      {/* 年齢グループ選択 */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">年齢グループ</h3>
        <div className="grid grid-cols-2 gap-2">
          {(["toddler", "child", "preteen", "teen"] as const).map((group) => (
            <Button
              key={group}
              variant={settings.ageGroup === group ? "default" : "outline"}
              onClick={() => setSettings({ ...settings, ageGroup: group })}
              className="text-sm"
            >
              {group === "toddler"
                ? "幼児 (2-4)"
                : group === "child"
                ? "子供 (5-8)"
                : group === "preteen"
                ? "児童 (9-12)"
                : "思春期 (13+)"}
            </Button>
          ))}
        </div>
      </Card>

      {/* スクリーンタイム制限 */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          1日のスクリーンタイム制限
        </h3>
        <Slider
          value={[settings.dailyScreenTimeLimit]}
          onValueChange={handleScreenTimeLimitChange}
          min={30}
          max={240}
          step={15}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">
          {settings.dailyScreenTimeLimit}分 / 日
        </p>
      </Card>

      {/* 就寝時間設定 */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          就寝時間
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">開始時刻</label>
            <input
              type="time"
              value={settings.bedtimeStart}
              onChange={handleBedtimeStartChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">終了時刻</label>
            <input
              type="time"
              value={settings.bedtimeEnd}
              onChange={handleBedtimeEndChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </Card>

      {/* コンテンツフィルター */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">コンテンツフィルター</h3>
        <div className="space-y-2">
          {(["strict", "moderate", "relaxed"] as const).map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="filter"
                value={level}
                checked={settings.contentFilterLevel === level}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    contentFilterLevel: e.target.value as any,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm">
                {level === "strict"
                  ? "厳格（推奨）"
                  : level === "moderate"
                  ? "中程度"
                  : "制限なし"}
              </span>
            </label>
          ))}
        </div>
      </Card>

      {/* アチーブメント */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" />
          アチーブメント
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg text-center ${
                achievement.unlocked
                  ? "bg-yellow-50 border-2 border-yellow-300"
                  : "bg-gray-50 border-2 border-gray-200 opacity-50"
              }`}
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <p className="text-xs font-semibold">{achievement.name}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 親向けダッシュボードリンク */}
      <Button variant="outline" className="w-full">
        親向けダッシュボードを表示
      </Button>
    </div>
  );
}
