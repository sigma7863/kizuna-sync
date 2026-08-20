import { useState } from "react";
import { CalendarHeart, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function FamilyCelebrationCalendar({ familyGroupId }: { familyGroupId: number }) {
  const [title, setTitle] = useState(""); const [date, setDate] = useState(""); const utils = trpc.useUtils();
  const { data: celebrations = [] } = trpc.celebrationCalendar.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.celebrationCalendar.create.useMutation({ onSuccess: () => { setTitle(""); setDate(""); return utils.celebrationCalendar.list.invalidate({ familyGroupId }); } });
  return <Card className="border-0 bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><CalendarHeart className="h-5 w-5 text-fuchsia-600" />お祝いカレンダー</CardTitle><p className="text-xs text-slate-500">誕生日や記念日を、家族みんなの予定に。</p></CardHeader><CardContent className="space-y-3"><div className="space-y-2 rounded-xl bg-white p-3 shadow-sm"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例：おばあちゃんの誕生日" maxLength={160} /><Input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} /><Button className="w-full bg-fuchsia-600 hover:bg-fuchsia-700" disabled={!title.trim() || !date || create.isPending} onClick={() => create.mutate({ familyGroupId, title, celebrationAt: new Date(date).toISOString() })}>{create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}お祝いを登録</Button></div><div className="space-y-2">{celebrations.slice(0, 4).map((item) => <div key={item.id} className="rounded-xl bg-white/85 p-3"><p className="text-sm font-semibold text-slate-800">{item.title}</p><p className="text-xs text-fuchsia-700">{new Date(item.celebrationAt).toLocaleString()}</p></div>)}</div></CardContent></Card>;
}
