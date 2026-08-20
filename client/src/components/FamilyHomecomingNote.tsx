import { useState } from "react";
import { Home, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

const moods = ["ほっとした", "元気", "ちょっと疲れた", "おなかすいた"];

export function FamilyHomecomingNote({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [moodSign, setMoodSign] = useState(moods[0]);
  const [note, setNote] = useState("");
  const { data: notes = [], isLoading } = trpc.homecomings.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.homecomings.create.useMutation({ onSuccess: async () => { setMoodSign(moods[0]); setNote(""); await utils.homecomings.list.invalidate({ familyGroupId }); } });
  return <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Home className="h-5 w-5 text-emerald-600"/>家族の帰宅ひとこと</CardTitle><p className="text-xs text-slate-500">「ただいま」と今の気分を、やさしく知らせよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="flex flex-wrap gap-1.5">{moods.map((mood) => <button key={mood} type="button" onClick={() => setMoodSign(mood)} className={`rounded-full px-2.5 py-1 text-xs ${moodSign === mood ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300" : "bg-white text-slate-600 shadow-sm"}`}>{mood}</button>)}</div><Input className="mt-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="例：ただいま。今日は図書館に寄ったよ" maxLength={180}/><Button size="sm" className="mt-2 w-full" disabled={!note.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, moodSign, note })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Send className="mr-1 h-4 w-4"/>帰宅を知らせる</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-emerald-700">帰宅メモを読み込み中です…</p> : <div className="grid gap-2">{notes.slice(0, 4).map((entry) => <article key={entry.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-sm font-semibold text-emerald-800">{entry.moodSign || "ただいま"}</p><p className="mt-1 text-xs text-slate-600">{entry.note}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p></article>)}{notes.length === 0 && <p className="rounded-xl border border-dashed border-emerald-200 p-3 text-center text-xs text-slate-500">最初の「ただいま」を家族に届けてみましょう。</p>}</div>}</CardContent></Card>;
}
