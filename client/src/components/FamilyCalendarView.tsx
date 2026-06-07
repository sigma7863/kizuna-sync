import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  memberName: string;
  color: string;
  category: string;
}

interface OptimalTime {
  startTime: Date;
  endTime: Date;
  availableMembers: number;
  confidence: number;
}

export default function FamilyCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [optimalMeetingTime, setOptimalMeetingTime] = useState<OptimalTime | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // カレンダーグリッドを生成
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // 空白セル
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-gray-50 p-2 h-24"></div>
      );
    }

    // 日付セル
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      ).toISOString().split("T")[0];
      const dayEvents = events.filter(
        (e) => e.startTime.toISOString().split("T")[0] === dateStr
      );

      days.push(
        <div
          key={day}
          className="border border-gray-200 p-2 h-24 hover:bg-blue-50 cursor-pointer"
        >
          <div className="font-semibold text-sm mb-1">{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="text-xs px-2 py-1 rounded truncate text-white"
                style={{ backgroundColor: event.color }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-pink-500" />
          <h2 className="text-2xl font-bold">家族カレンダー</h2>
        </div>
        <div className="flex gap-2">
          {(["month", "week", "day"] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              onClick={() => setViewMode(mode)}
              className="capitalize"
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {/* 最適な会議時間提案 */}
      {optimalMeetingTime && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">
                最適な家族会議時間
              </h3>
              <div className="space-y-1 text-sm text-purple-800">
                <p>
                  <Clock className="w-4 h-4 inline mr-2" />
                  {optimalMeetingTime.startTime.toLocaleTimeString()} -{" "}
                  {optimalMeetingTime.endTime.toLocaleTimeString()}
                </p>
                <p>
                  <Users className="w-4 h-4 inline mr-2" />
                  {optimalMeetingTime.availableMembers}人が参加可能
                </p>
                <p className="text-xs">
                  信頼度: {optimalMeetingTime.confidence}%
                </p>
              </div>
            </div>
            <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
              この時間で設定
            </Button>
          </div>
        </Card>
      )}

      {/* カレンダーコントロール */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
        <Button variant="outline" onClick={handlePrevMonth}>
          ← 前月
        </Button>
        <h3 className="text-lg font-semibold">
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </h3>
        <Button variant="outline" onClick={handleNextMonth}>
          翌月 →
        </Button>
      </div>

      {/* カレンダーグリッド */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-gray-100 border-b">
          {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* カレンダー日付 */}
        <div className="grid grid-cols-7">{renderCalendarGrid()}</div>
      </div>

      {/* イベントリスト */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">今月のイベント</h3>
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            イベントがありません
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <Card
                key={event.id}
                className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                ></div>
                <div className="flex-1">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.memberName}</p>
                </div>
                <div className="text-sm text-gray-600">
                  {event.startTime.toLocaleTimeString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
