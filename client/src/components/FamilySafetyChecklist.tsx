import { useState } from "react";
import { Check, Loader2, Plus, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function FamilySafetyChecklist({ familyGroupId }: { familyGroupId: number }) {
  const [label, setLabel] = useState(""); const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.safetyChecklist.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.safetyChecklist.create.useMutation({ onSuccess: () => { setLabel(""); return utils.safetyChecklist.list.invalidate({ familyGroupId }); } });
  const toggle = trpc.safetyChecklist.toggle.useMutation({ onSuccess: () => utils.safetyChecklist.list.invalidate({ familyGroupId }) });
  return <Card className="border-0 bg-gradient-to-br from-red-50 via-white to-amber-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="h-5 w-5 text-red-500" />家族の防災チェック</CardTitle><p className="text-xs text-slate-500">非常時の備えを、みんなで少しずつ確認。</p></CardHeader><CardContent className="space-y-3"><div className="flex gap-2"><Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="例：飲料水を確認" maxLength={180} /><Button size="icon" disabled={!label.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, label, category: "備え" })}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}</Button></div>{isLoading ? <div className="py-5 text-center text-xs text-slate-500">読み込み中…</div> : <div className="space-y-2">{items.map((item) => <button type="button" key={item.id} onClick={() => toggle.mutate({ familyGroupId, itemId: item.id, isCompleted: !item.isCompleted })} className={`flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-sm ${item.isCompleted ? "bg-emerald-50 text-slate-400" : "bg-white shadow-sm"}`}><span className={`grid h-5 w-5 place-items-center rounded-full border ${item.isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : "border-red-300"}`}>{item.isCompleted && <Check className="h-3.5 w-3.5" />}</span><span className={item.isCompleted ? "line-through" : "text-slate-700"}>{item.label}</span></button>)}{items.length === 0 && <p className="rounded-xl border border-dashed border-red-200 p-3 text-center text-xs text-slate-500">備えたいことを追加しましょう。</p>}</div>}</CardContent></Card>;
}
