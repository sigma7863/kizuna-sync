import { useEffect, useState } from "react";
import { CalendarClock, BookOpen, Save, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const weekdays = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

export function FamilyAutomationPanel({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const { data: schedule } = trpc.photoJournal.getSchedule.useQuery({ familyGroupId });
  const { data: journals = [] } = trpc.photoJournal.list.useQuery({ familyGroupId });
  const [enabled, setEnabled] = useState(false);
  const [weekday, setWeekday] = useState(0);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const saveMutation = trpc.photoJournal.saveSchedule.useMutation({
    onSuccess: (result) => {
      setEnabled(result.enabled);
      void utils.photoJournal.getSchedule.invalidate({ familyGroupId });
    },
  });

  useEffect(() => {
    if (!schedule) return;
    setEnabled(schedule.enabled);
    setWeekday(schedule.weekday);
    setHour(schedule.hour);
    setMinute(schedule.minute);
  }, [schedule]);

  const save = () => saveMutation.mutate({ familyGroupId, enabled, weekday, hour, minute });

  return (
    <div className="space-y-5">
      <Card className="border-0 bg-white p-5 shadow-md">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-600"><CalendarClock className="h-5 w-5" /></div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800">週次AIフォトジャーナル</h2>
            <p className="mt-1 text-sm text-gray-500">直近7日間の写真をAIが温かな物語にまとめます。</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="週次フォトジャーナルを有効にする" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <label className="text-sm text-gray-600">曜日<select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 text-gray-800">{weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}</select></label>
          <label className="text-sm text-gray-600">時<select value={hour} onChange={(e) => setHour(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 text-gray-800">{Array.from({ length: 24 }, (_, index) => <option key={index} value={index}>{String(index).padStart(2, "0")}</option>)}</select></label>
          <label className="text-sm text-gray-600">分<select value={minute} onChange={(e) => setMinute(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 text-gray-800">{[0, 15, 30, 45].map((value) => <option key={value} value={value}>{String(value).padStart(2, "0")}</option>)}</select></label>
        </div>
        <Button onClick={save} disabled={saveMutation.isPending} className="mt-4 w-full bg-amber-500 text-white hover:bg-amber-600"><Save className="mr-2 h-4 w-4" />{saveMutation.isPending ? "保存中…" : "週次設定を保存"}</Button>
        <p className="mt-3 text-xs leading-relaxed text-gray-400">実行時刻はUTC基準です。本番サイトをデプロイした後に初めて有効化してください。</p>
      </Card>

      <Card className="border-0 bg-white p-5 shadow-md">
        <div className="mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-pink-500" /><h3 className="font-semibold text-gray-800">生成された家族の物語</h3></div>
        {journals.length === 0 ? <p className="text-sm text-gray-500">まだ週次ジャーナルはありません。</p> : <div className="space-y-3">{journals.map((journal) => <article key={journal.id} className="rounded-xl bg-pink-50 p-4"><div className="flex items-center gap-2 text-xs text-pink-600"><Sparkles className="h-4 w-4" />{new Date(journal.createdAt).toLocaleDateString()}</div><h4 className="mt-1 font-semibold text-gray-800">{journal.title}</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{journal.story}</p></article>)}</div>}
      </Card>
    </div>
  );
}
