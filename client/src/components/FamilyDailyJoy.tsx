import { useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { countDailyJoys, getLocalDayKey } from "@shared/familyDailyJoy";

export function FamilyDailyJoy({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [dayKey] = useState(() => getLocalDayKey()); const [joy, setJoy] = useState("");
  const { data: entries = [], isLoading } = trpc.dailyJoys.list.useQuery({ familyGroupId, dayKey }, { enabled: familyGroupId > 0 });
  const create = trpc.dailyJoys.create.useMutation({ onSuccess: async () => { setJoy(""); await utils.dailyJoys.list.invalidate({ familyGroupId, dayKey }); } });
  return <Card className="border-0 bg-gradient-to-br from-yellow-50 via-white to-amber-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-amber-600"/>家族の今日の小さな楽しみ</CardTitle><p className="text-xs text-slate-500">今日の楽しみを共有して、やさしい声かけにつなげよう。</p></CardHeader><CardContent className="space-y-3"><p className="text-xs font-medium text-amber-700">今日の楽しみ：{countDailyJoys(entries)}件</p><div className="flex gap-2 rounded-xl bg-white/80 p-3"><Input value={joy} onChange={(event) => setJoy(event.target.value)} placeholder="例：帰りに好きなパンを買う" maxLength={180}/><Button size="icon" aria-label="今日の楽しみを共有する" disabled={!joy.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, dayKey, joy })}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-amber-700">楽しみを読み込み中です…</p> : <div className="grid gap-2">{entries.map((entry) => <article key={entry.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="flex gap-1 text-sm text-slate-800"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"/>{entry.joy}</p></article>)}{entries.length === 0 && <p className="rounded-xl border border-dashed border-amber-200 p-3 text-center text-xs text-slate-500">今日を少し楽しみにできることを、一つ残してみましょう。</p>}</div>}</CardContent></Card>;
}
