import { useMemo, useState } from "react";
import { Battery, BatteryLow, BatteryMedium, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getEnergyCue, type EnergyLevel } from "@shared/familyEncouragement";

const levels: EnergyLevel[] = [1, 2, 3, 4, 5];

export function FamilyEnergyMeter({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(3);
  const [note, setNote] = useState("");
  const { data: statuses = [], isLoading } = trpc.energyStatuses.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: members = [] } = trpc.family.getMembers.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const share = trpc.energyStatuses.share.useMutation({ onSuccess: async () => { setNote(""); await utils.energyStatuses.list.invalidate({ familyGroupId }); } });
  const latestByUser = useMemo(() => new Map(statuses.map((status) => [status.userId, status])), [statuses]);
  const activeCue = getEnergyCue(energyLevel);

  return <Card className="border-0 bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Battery className="h-5 w-5 text-indigo-600"/>家族の電池メーター</CardTitle><p className="text-xs text-slate-500">今の余力を自分で選んで、無理のない声かけへ。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="flex justify-between gap-1">{levels.map((level) => { const cue = getEnergyCue(level); return <button key={level} type="button" onClick={() => setEnergyLevel(level)} className={`flex-1 rounded-xl px-1 py-2 text-center text-[11px] ${energyLevel === level ? "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300" : "bg-white text-slate-500 shadow-sm"}`}><span className="block text-base">{level <= 1 ? "🔋" : level === 2 ? "🔋🔋" : level === 3 ? "🔋🔋🔋" : level === 4 ? "🔋🔋🔋🔋" : "🔋🔋🔋🔋🔋"}</span>{cue.label}</button>; })}</div><Input className="mt-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="ひとこと（任意）" maxLength={160}/><Button size="sm" className="mt-2 w-full" disabled={share.isPending} onClick={() => share.mutate({ familyGroupId, energyLevel, note })}>{share.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Battery className="mr-1 h-4 w-4"/>今の電池を共有</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-indigo-700">電池メーターを読み込み中です…</p> : <div className="grid grid-cols-2 gap-2">{members.map((member) => { const status = latestByUser.get(member.users.id); const cue = status ? getEnergyCue(status.energyLevel as EnergyLevel) : null; return <div key={member.users.id} className="rounded-xl bg-white p-3 shadow-sm"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">{(member.users.name ?? "?").charAt(0)}</span><p className="text-xs font-semibold text-slate-700">{member.users.name ?? "家族"}</p></div><p className="mt-2 flex items-center gap-1 text-[11px] text-indigo-700">{status ? <>{status.energyLevel <= 2 ? <BatteryLow className="h-3.5 w-3.5"/> : status.energyLevel === 3 ? <BatteryMedium className="h-3.5 w-3.5"/> : <Battery className="h-3.5 w-3.5"/>}{cue?.label}</> : "未共有"}</p>{status?.note && <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{status.note}</p>}</div>; })}</div>}<p className="text-[10px] leading-relaxed text-slate-400">医療情報ではなく、その日の余力を本人が選んで伝えるためのメーターです。</p></CardContent></Card>;
}
