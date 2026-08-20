import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Loader2, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { parseMorningItems } from "@shared/familyMorningRhythm";

const moods = ["元気", "ふつう", "ゆっくり"];

export function FamilyMorningBoard({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [departureTime, setDepartureTime] = useState("");
  const [moodSign, setMoodSign] = useState(moods[1]);
  const [carryingItems, setCarryingItems] = useState("");
  const [isReady, setIsReady] = useState(false);
  const { data: plans = [], isLoading } = trpc.morningPlans.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: members = [] } = trpc.family.getMembers.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const share = trpc.morningPlans.share.useMutation({ onSuccess: async () => { setCarryingItems(""); await utils.morningPlans.list.invalidate({ familyGroupId }); } });
  const latestByUser = useMemo(() => new Map(plans.map((plan) => [plan.userId, plan])), [plans]);

  return <Card className="border-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Sun className="h-5 w-5 text-orange-500"/>家族の朝支度ボード</CardTitle><p className="text-xs text-slate-500">持ち物・出発・気分を短く整えて、朝をやさしく始めよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="flex gap-2"><Input type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} aria-label="出発時刻"/><button type="button" onClick={() => setIsReady((current) => !current)} className={`shrink-0 rounded-md px-3 text-xs font-medium ${isReady ? "bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300" : "bg-slate-100 text-slate-600"}`}>{isReady ? "準備できた" : "準備中"}</button></div><div className="mt-2 flex gap-1.5">{moods.map((mood) => <button key={mood} type="button" onClick={() => setMoodSign(mood)} className={`rounded-full px-2.5 py-1 text-xs ${moodSign === mood ? "bg-orange-100 text-orange-800 ring-2 ring-orange-300" : "bg-white text-slate-600 shadow-sm"}`}>{mood}</button>)}</div><Input className="mt-2" value={carryingItems} onChange={(event) => setCarryingItems(event.target.value)} placeholder="持ち物（例：水筒、宿題、ハンカチ）" maxLength={280}/><Button size="sm" className="mt-2 w-full" disabled={share.isPending} onClick={() => share.mutate({ familyGroupId, departureTime, moodSign, carryingItems, isReady })}>{share.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><CheckCircle2 className="mr-1 h-4 w-4"/>朝の状況を共有</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-orange-700">朝支度を読み込み中です…</p> : <div className="grid grid-cols-2 gap-2">{members.map((member) => { const plan = latestByUser.get(member.users.id); return <div key={member.users.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-xs font-semibold text-slate-700">{member.users.name ?? "家族"}</p>{plan ? <><p className="mt-1 flex items-center gap-1 text-[11px] text-orange-700"><Clock3 className="h-3.5 w-3.5"/>{plan.departureTime || "出発時刻なし"} · {plan.moodSign || "ふつう"}</p><p className="mt-1 text-[11px] text-slate-500">{plan.isReady ? "準備できた" : "準備中"}{parseMorningItems(plan.carryingItems ?? "").length > 0 ? ` · ${parseMorningItems(plan.carryingItems ?? "").join(" / ")}` : ""}</p></> : <p className="mt-1 text-[11px] text-slate-400">まだ共有されていません</p>}</div>; })}</div>}</CardContent></Card>;
}
