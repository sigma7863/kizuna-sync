import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Plus, Clock, MapPin } from 'lucide-react';

interface ScheduleEvent {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  color: string;
  userName: string;
}

interface FamilyScheduleManagerProps {
  familyGroupId: number;
  events?: ScheduleEvent[];
  onAddEvent?: (event: any) => void;
}

export function FamilyScheduleManager({
  familyGroupId,
  events = [],
  onAddEvent,
}: FamilyScheduleManagerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  const getDayEvents = (date: Date) => {
    return events.filter((event) => {
      const eventDate = event.startTime instanceof Date ? event.startTime : new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const dayEvents = getDayEvents(selectedDate);

  const handleAddEvent = () => {
    if (formData.title && formData.startTime && formData.endTime) {
      onAddEvent?.({
        title: formData.title,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        location: formData.location,
      });
      setFormData({ title: '', startTime: '', endTime: '', location: '' });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pink-500" />
          <h3 className="font-semibold text-gray-800">家族スケジュール</h3>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-pink-500 hover:bg-pink-600 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          予定追加
        </Button>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <Card className="p-4 bg-pink-50 border-pink-200">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="予定のタイトル"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="px-3 py-2 border border-pink-200 rounded-lg text-sm"
              />
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="px-3 py-2 border border-pink-200 rounded-lg text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="場所（オプション）"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-pink-200 rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddEvent}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white text-sm"
              >
                追加
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="flex-1 text-sm"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
        <button
          onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
          className="text-gray-600 hover:text-gray-800"
        >
          ←
        </button>
        <span className="font-semibold text-gray-800">
          {selectedDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <button
          onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
          className="text-gray-600 hover:text-gray-800"
        >
          →
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {dayEvents.length > 0 ? (
          dayEvents.map((event) => (
            <Card
              key={event.id}
              className="p-3 border-l-4"
              style={{ borderLeftColor: event.color }}
            >
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {(event.startTime instanceof Date ? event.startTime : new Date(event.startTime)).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">{event.userName}</p>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">この日の予定はありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
