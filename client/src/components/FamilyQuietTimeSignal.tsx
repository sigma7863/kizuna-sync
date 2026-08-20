import { useMemo, useState } from "react";
import { BedDouble, Coffee, Focus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getQuietStateLabel, type QuietState } from "@shared/familyMindfulMoments";

const stateMeta = { focus: { icon: Focus, label: "集中中" }, rest: { icon: Coffee, label: "休憩中" }, sleeping: { icon: BedDouble, label: "おやすみ中" } } as const;

export function FamilyQuietTimeSignal({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [state, setState] = useState<QuietState>("focus"); const [note, setNote] = useState(""); const [untilTime, setUntilTime] = useState("");
  const { data: signals = [], isLoading } = trpc.quietTime.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: members = [] } = trpc.family.getMembers.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const share = trpc.quietTime.share.useMutation({ onSuccess: async () => { setNote(""); setUntilTime(""); await utils.quietTime.list.invalidate({ familyGroupId }); } });
  const latestByUser = useMemo(() => new Map(signals.map((signal) => [signal.userId, signal])), [signals]);
  const untilAt = untilTime ? new Date(`${new Date().toISOString().slice(0, 10)}T${untilTime}:00`) : undefined;
  return <Card className="border-0 bg-gradient-to-br from-slate-100 via-white to-indigo-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Focus className="h-5 w-5 text-indigo-600"/>家族の静かな時間サイン</CardTitle><p className="text-xs text-slate-500">集中・休憩・おやすみ中を共有して、互いの時間を大切に。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="grid grid-cols-3 gap-1.5">{(Object.keys(stateMeta) as QuietState[]).map((key) => { const Icon = stateMeta[key].icon; return <button key={key} type="button" onClick={() => setState(key)} className={`rounded-lg p-2 text-xs ${state === key ? "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300" : "bg-white text-slate-600 shadow-sm"}`}><Icon className="mx-auto h-4 w-4"/><span className="mt-1 block">{stateMeta[key].label}</span></button>; })}</div><div className="mt-2 grid grid-cols-[minmax(0,1fr)_6rem] gap-2"><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="ひとこと（任意）" maxLength={180}/><Input type="time" value={untilTime} onChange={(event) => setUntilTime(event.target.value)} aria-label="目安の終了時刻"/></div><Button size="sm" className="mt-2 w-full" disabled={share.isPending} onClick={() => share.mutate({ familyGroupId, state, note, untilAt })}>{share.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : "今の状態を共有"}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-indigo-700">静かな時間を読み込み中です…</p> : <div className="grid grid-cols-2 gap-2">{members.map((member) => { const signal = latestByUser.get(member.users.id); return <div key={member.users.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-xs font-semibold text-slate-700">{member.users.name ?? "家族"}</p>{signal ? <><p className="mt-1 text-[11px] text-indigo-700">{getQuietStateLabel(signal.state as QuietState)}{signal.untilAt ? ` · ${new Date(signal.untilAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}まで` : ""}</p>{signal.note && <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{signal.note}</p>}</> : <p className="mt-1 text-[11px] text-slate-400">未共有</p>}</div>; })}</div>}</CardContent></Card>;
}
