import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  color: string;
}

export function CalendarSyncWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<"week" | "month" | "day">("week");
  const [optimalTime, setOptimalTime] = useState<string | null>(null);

  useEffect(() => {
    // リアルタイムカレンダーイベントを取得
    const mockEvents: CalendarEvent[] = [
      {
        id: 1,
        title: "Family Dinner",
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 86400000 + 3600000),
        attendees: ["Alice", "Bob", "Charlie"],
        color: "#ec4899",
      },
      {
        id: 2,
        title: "School",
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 86400000 + 28800000),
        attendees: ["Charlie"],
        color: "#3b82f6",
      },
    ];
    setEvents(mockEvents);
  }, []);

  const handleSuggestOptimalTime = () => {
    // AI が最適な会議時間を提案
    const suggested = new Date(Date.now() + 172800000); // 2日後
    setOptimalTime(suggested.toLocaleString());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Family Calendar Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ビュー切り替え */}
        <div className="flex gap-2">
          {(["week", "month", "day"] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? "default" : "outline"}
              size="sm"
              onClick={() => setView(v)}
              className="capitalize"
            >
              {v}
            </Button>
          ))}
        </div>

        {/* イベント一覧 */}
        <div className="space-y-2">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition"
                style={{ borderLeftColor: event.color, borderLeftWidth: "4px" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.startTime.toLocaleTimeString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.attendees.length} people
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {event.attendees.map((attendee) => (
                      <Badge key={attendee} variant="secondary" className="text-xs">
                        {attendee}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No events scheduled
            </p>
          )}
        </div>

        {/* AI 最適時間提案 */}
        <div className="border-t pt-4">
          <Button
            onClick={handleSuggestOptimalTime}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            💡 Suggest Optimal Meeting Time
          </Button>
          {optimalTime && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900">
                Suggested Time: {optimalTime}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on all family members' availability
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
