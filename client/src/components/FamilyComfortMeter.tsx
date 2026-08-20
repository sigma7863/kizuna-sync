import { useState } from "react";
import { Cloud, CloudRain, Loader2, Send, Sun, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { comfortColorLabels } from "@shared/familyTogetherComfort";

type ComfortColor = keyof typeof comfortColorLabels;
const colorIcons = { sunny: Sun, soft: Waves, cloudy: Cloud, rainy: CloudRain };
const colorClasses = { sunny: "bg-amber-500 text-white", soft: "bg-emerald-500 text-white", cloudy: "bg-slate-500 text-white", rainy: "bg-indigo-500 text-white" };

export function FamilyComfortMeter({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [color, setColor] = useState<ComfortColor>("soft"); const [message, setMessage] = useState("");
  const { data: meters = [], isLoading } = trpc.comfortMeters.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.comfortMeters.create.useMutation({ onSuccess: async () => { setMessage(""); await utils.comfortMeters.list.invalidate({ familyGroupId }); } });
  return <Card className="border-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Waves className="h-5 w-5 text-sky-700"/>家族の今日の安心メーター</CardTitle><p className="text-xs text-slate-500">数字ではなく、今の色と短い言葉で安心度を伝えよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="grid grid-cols-4 gap-1">{(Object.keys(comfortColorLabels) as ComfortColor[]).map((key) => { const Icon = colorIcons[key]; return <button key={key} type="button" onClick={() => setColor(key)} className={`rounded-lg px-1 py-2 text-[10px] transition active:scale-95 ${color === key ? colorClasses[key] : "bg-slate-100 text-slate-700"}`}><Icon className="mx-auto mb-0.5 h-4 w-4"/>{comfortColorLabels[key]}</button>; })}</div><div className="mt-2 flex gap-2"><Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="今の自分に必要なこと（任意）" maxLength={160}/><Button size="icon" aria-label="安心メーターを共有する" disabled={create.isPending} onClick={() => create.mutate({ familyGroupId, color, message })}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</Button></div></div>{isLoading ? <p className="py-3 text-center text-xs text-sky-700">安心メーターを読み込み中です…</p> : <div className="grid gap-2">{meters.slice(0, 4).map((meter) => { const Icon = colorIcons[meter.color]; return <article key={meter.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="flex items-center gap-1 text-xs font-medium text-sky-800"><Icon className="h-4 w-4"/>{comfortColorLabels[meter.color]}</p>{meter.message && <p className="mt-1 text-sm text-slate-800">{meter.message}</p>}</article>; })}{meters.length === 0 && <p className="rounded-xl border border-dashed border-sky-200 p-3 text-center text-xs text-slate-500">今日の自分の色を選んで、家族に伝えてみましょう。</p>}</div>}</CardContent></Card>;
}
