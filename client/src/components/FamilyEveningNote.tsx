import { useState } from "react";
import { Loader2, MoonStar, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { EveningMood, getMoodLabel } from "@shared/familyEveningRhythm";

const moods: Array<{ key: EveningMood; mark: string }> = [
  { key: "calm", mark: "◌" }, { key: "tired", mark: "☾" }, { key: "happy", mark: "✦" }, { key: "anxious", mark: "~" }, { key: "grateful", mark: "♡" },
];

export function FamilyEveningNote({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [mood, setMood] = useState<EveningMood>("calm"); const [note, setNote] = useState("");
  const { data: entries = [], isLoading } = trpc.eveningNotes.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.eveningNotes.create.useMutation({ onSuccess: async () => { setNote(""); await utils.eveningNotes.list.invalidate({ familyGroupId }); } });
  return <Card className="border-0 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 text-white shadow-lg"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-white"><MoonStar className="h-5 w-5 text-amber-200"/>家族の夜のひとこと</CardTitle><p className="text-xs text-indigo-200">眠る前の気分や安心を、そっと伝えよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/10 p-3"><div className="grid grid-cols-5 gap-1">{moods.map((item) => <button key={item.key} type="button" onClick={() => setMood(item.key)} className={`rounded-lg px-1 py-2 text-center text-[10px] transition active:scale-95 ${mood === item.key ? "bg-amber-200 text-indigo-950" : "bg-white/10 text-white hover:bg-white/20"}`}><span className="block text-base">{item.mark}</span>{getMoodLabel(item.key)}</button>)}</div><div className="mt-2 flex gap-2"><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="今夜のひとこと（任意）" className="border-white/20 bg-white text-slate-800 placeholder:text-slate-400" maxLength={180}/><Button size="icon" disabled={create.isPending} onClick={() => create.mutate({ familyGroupId, mood, note })} aria-label="夜のひとことを送る">{create.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</Button></div></div>{isLoading ? <p className="py-3 text-center text-xs text-indigo-200">ひとことを読み込み中です…</p> : <div className="grid gap-2">{entries.slice(0, 4).map((entry) => <article key={entry.id} className="rounded-xl bg-white/10 p-2.5"><p className="text-xs text-amber-100">{getMoodLabel(entry.mood)} · {new Date(entry.createdAt).toLocaleDateString()}</p>{entry.note && <p className="mt-1 text-sm text-white">{entry.note}</p>}</article>)}{entries.length === 0 && <p className="rounded-xl border border-dashed border-indigo-300/40 p-3 text-center text-xs text-indigo-100">今夜の気持ちを一つ残して、安心の合図にしましょう。</p>}</div>}</CardContent></Card>;
}
