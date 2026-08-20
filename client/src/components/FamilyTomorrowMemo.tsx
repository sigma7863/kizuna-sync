import { useState } from "react";
import { CalendarDays, HeartHandshake, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getTomorrowRange, tomorrowKindLabels } from "@shared/familyTomorrowFlow";

type TomorrowKind = keyof typeof tomorrowKindLabels;
const kindIcons = { plan: CalendarDays, care: HeartHandshake, fun: Sparkles };

export function FamilyTomorrowMemo({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [range] = useState(() => getTomorrowRange()); const [kind, setKind] = useState<TomorrowKind>("plan"); const [note, setNote] = useState("");
  const { data: memos = [], isLoading } = trpc.tomorrowMemos.list.useQuery({ familyGroupId, from: range.start, to: range.end }, { enabled: familyGroupId > 0 });
  const create = trpc.tomorrowMemos.create.useMutation({ onSuccess: async () => { setNote(""); await utils.tomorrowMemos.list.invalidate({ familyGroupId, from: range.start, to: range.end }); } });
  return <Card className="border-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="h-5 w-5 text-sky-700"/>家族のあしたメモ</CardTitle><p className="text-xs text-slate-500">明日の予定、気づかい、楽しみをひとつ先に伝えよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="grid grid-cols-3 gap-1">{(Object.keys(tomorrowKindLabels) as TomorrowKind[]).map((key) => { const Icon = kindIcons[key]; return <button key={key} type="button" onClick={() => setKind(key)} className={`rounded-lg px-1 py-2 text-xs transition active:scale-95 ${kind === key ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-800 hover:bg-sky-100"}`}><Icon className="mr-1 inline h-3.5 w-3.5"/>{tomorrowKindLabels[key]}</button>; })}</div><div className="mt-2 flex gap-2"><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="明日、伝えておきたいこと" maxLength={280}/><Button size="icon" aria-label="あしたメモを残す" disabled={!note.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, targetDate: range.start, kind, note })}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</Button></div></div>{isLoading ? <p className="py-3 text-center text-xs text-sky-700">あしたメモを読み込み中です…</p> : <div className="grid gap-2">{memos.map((memo) => { const Icon = kindIcons[memo.kind]; return <article key={memo.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-xs font-medium text-sky-700"><Icon className="mr-1 inline h-3.5 w-3.5"/>{tomorrowKindLabels[memo.kind]}</p><p className="mt-1 text-sm text-slate-800">{memo.note}</p></article>; })}{memos.length === 0 && <p className="rounded-xl border border-dashed border-sky-200 p-3 text-center text-xs text-slate-500">明日の自分や家族が少し楽になるひとことを残してみましょう。</p>}</div>}</CardContent></Card>;
}
