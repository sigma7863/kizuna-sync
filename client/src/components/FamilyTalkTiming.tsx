import { useState } from "react";
import { Coffee, Loader2, MessageCircleHeart, Moon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { talkTimingLabels } from "@shared/familyGentleConnection";

type TalkState = keyof typeof talkTimingLabels;
const stateIcons = { available: MessageCircleHeart, later: Coffee, quiet: Moon };

export function FamilyTalkTiming({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [state, setState] = useState<TalkState>("available"); const [note, setNote] = useState("");
  const { data: timings = [], isLoading } = trpc.talkTimings.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const share = trpc.talkTimings.share.useMutation({ onSuccess: async () => { setNote(""); await utils.talkTimings.list.invalidate({ familyGroupId }); } });
  return <Card className="border-0 bg-gradient-to-br from-violet-50 via-white to-purple-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><MessageCircleHeart className="h-5 w-5 text-violet-700"/>家族の声かけタイミング</CardTitle><p className="text-xs text-slate-500">今の話しやすさを伝えて、お互いの時間を尊重しよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="grid grid-cols-3 gap-1">{(Object.keys(talkTimingLabels) as TalkState[]).map((key) => { const Icon = stateIcons[key]; return <button key={key} type="button" onClick={() => setState(key)} className={`rounded-lg px-1 py-2 text-[11px] transition active:scale-95 ${state === key ? "bg-violet-600 text-white" : "bg-violet-50 text-violet-800 hover:bg-violet-100"}`}><Icon className="mx-auto mb-0.5 h-4 w-4"/>{talkTimingLabels[key]}</button>; })}</div><div className="mt-2 flex gap-2"><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="ひとこと（任意）" maxLength={160}/><Button size="icon" aria-label="話しやすさを共有する" disabled={share.isPending} onClick={() => share.mutate({ familyGroupId, state, note })}>{share.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</Button></div></div>{isLoading ? <p className="py-3 text-center text-xs text-violet-700">タイミングを読み込み中です…</p> : <div className="grid gap-2">{timings.slice(0, 4).map((timing) => { const Icon = stateIcons[timing.state]; return <article key={timing.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="flex items-center gap-1 text-xs font-medium text-violet-800"><Icon className="h-4 w-4"/>{talkTimingLabels[timing.state]}</p>{timing.note && <p className="mt-1 text-sm text-slate-800">{timing.note}</p>}</article>; })}{timings.length === 0 && <p className="rounded-xl border border-dashed border-violet-200 p-3 text-center text-xs text-slate-500">今の気分に合う声かけタイミングを、最初に共有してみましょう。</p>}</div>}</CardContent></Card>;
}
