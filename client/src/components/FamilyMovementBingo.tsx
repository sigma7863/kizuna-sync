import { useState } from "react";
import { Check, CirclePlus, Footprints, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getMovementBingoProgress } from "@shared/familyDailyRhythm";

const starters = [{ icon: "🚶", label: "10分歩く" }, { icon: "🧘", label: "のびをする" }, { icon: "🌿", label: "外の空気を吸う" }, { icon: "💧", label: "水を一杯飲む" }];

export function FamilyMovementBingo({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("🚶");
  const { data: cells = [], isLoading } = trpc.movementBingo.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.movementBingo.create.useMutation({ onSuccess: async () => { setLabel(""); setIcon("🚶"); await utils.movementBingo.list.invalidate({ familyGroupId }); } });
  const toggle = trpc.movementBingo.toggle.useMutation({ onSuccess: () => utils.movementBingo.list.invalidate({ familyGroupId }) });
  const progress = getMovementBingoProgress(cells);

  return <Card className="border-0 bg-gradient-to-br from-lime-50 via-white to-emerald-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Footprints className="h-5 w-5 text-lime-600"/>家族のゆる運動ビンゴ</CardTitle><p className="text-xs text-slate-500">小さな体の動きを、できたらぽんっと埋めよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="mb-2 flex flex-wrap gap-1">{starters.map((starter) => <button key={starter.label} type="button" onClick={() => { setLabel(starter.label); setIcon(starter.icon); }} className="rounded-full bg-lime-50 px-2 py-1 text-[11px] text-lime-800">{starter.icon} {starter.label}</button>)}</div><div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2"><Input value={icon} onChange={(event) => setIcon(event.target.value)} aria-label="アイコン" maxLength={16}/><Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="やってみること" maxLength={100}/></div><Button size="sm" className="mt-2 w-full" disabled={!label.trim() || create.isPending || cells.length >= 9} onClick={() => create.mutate({ familyGroupId, label, icon })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><CirclePlus className="mr-1 h-4 w-4"/>マスを追加</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-lime-700">ビンゴを読み込み中です…</p> : <><p className="text-xs font-medium text-lime-800">できたマス：{progress.completed} / {progress.total}{progress.isBingo ? "　みんなで達成！" : ""}</p><div className="grid grid-cols-3 gap-2">{cells.map((cell) => <button key={cell.id} type="button" disabled={toggle.isPending} onClick={() => toggle.mutate({ familyGroupId, cellId: cell.id, isCompleted: !cell.isCompleted })} className={`min-h-20 rounded-xl border p-2 text-left transition active:scale-[0.98] ${cell.isCompleted ? "border-lime-300 bg-lime-100" : "border-white bg-white shadow-sm"}`}><span className="text-lg">{cell.icon || "🌱"}</span><span className="mt-1 block text-[11px] font-medium text-slate-700">{cell.label}</span>{cell.isCompleted && <Check className="mt-1 h-3.5 w-3.5 text-lime-700"/>}</button>)}</div>{cells.length === 0 && <p className="rounded-xl border border-dashed border-lime-200 p-3 text-center text-xs text-slate-500">できそうなことを一つ、ビンゴに追加しましょう。</p>}</>}</CardContent></Card>;
}
