import { useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getEncouragementStampLabel, type EncouragementStamp } from "@shared/familyDailyFlow";

const stamps: Array<{ value: EncouragementStamp; icon: string }> = [{ value: "sun", icon: "☀️" }, { value: "heart", icon: "💛" }, { value: "clap", icon: "👏" }, { value: "rainbow", icon: "🌈" }];

export function FamilyEncouragementStamps({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [stamp, setStamp] = useState<EncouragementStamp>("sun"); const [message, setMessage] = useState("");
  const { data: entries = [], isLoading } = trpc.encouragementStamps.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.encouragementStamps.create.useMutation({ onSuccess: async () => { setStamp("sun"); setMessage(""); await utils.encouragementStamps.list.invalidate({ familyGroupId }); } });
  const iconFor = (value: EncouragementStamp) => stamps.find((item) => item.value === value)?.icon ?? "✨";
  return <Card className="border-0 bg-gradient-to-br from-yellow-50 via-white to-pink-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-5 w-5 text-yellow-600"/>家族の小さな応援スタンプ</CardTitle><p className="text-xs text-slate-500">言葉に加えて、気持ちを簡単に届ける家族だけの反応。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="grid grid-cols-4 gap-2">{stamps.map((item) => <button key={item.value} type="button" onClick={() => setStamp(item.value)} className={`rounded-xl p-2 text-center ${stamp === item.value ? "bg-yellow-100 ring-2 ring-yellow-300" : "bg-white shadow-sm"}`}><span className="block text-xl">{item.icon}</span><span className="mt-1 block text-[10px] text-slate-600">{getEncouragementStampLabel(item.value)}</span></button>)}</div><Input className="mt-2" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="ひとこと（任意）" maxLength={180}/><Button size="sm" className="mt-2 w-full bg-yellow-500 text-slate-900 hover:bg-yellow-600" disabled={create.isPending} onClick={() => create.mutate({ familyGroupId, stamp, message })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Send className="mr-1 h-4 w-4"/>応援を送る</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-yellow-700">応援を読み込み中です…</p> : <div className="grid gap-2">{entries.slice(0, 6).map((entry) => <article key={entry.id} className="flex gap-2 rounded-xl bg-white p-3 shadow-sm"><span className="text-lg">{iconFor(entry.stamp as EncouragementStamp)}</span><div><p className="text-xs font-semibold text-yellow-800">{getEncouragementStampLabel(entry.stamp as EncouragementStamp)}</p>{entry.message && <p className="mt-1 text-xs text-slate-600">{entry.message}</p>}</div></article>)}{entries.length === 0 && <p className="rounded-xl border border-dashed border-yellow-200 p-3 text-center text-xs text-slate-500">最初の応援スタンプを送ってみましょう。</p>}</div>}</CardContent></Card>;
}
