import { CalendarDays, Loader2, Plus, Send } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const activityLabels = { indoor: "室内", outdoor: "屋外", hybrid: "どちらでも" } as const;

export function FamilyWeekendPlanner({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState<"indoor" | "outdoor" | "hybrid">("indoor");
  const { data: plans = [], isLoading, isError } = trpc.weekendPlanner.list.useQuery({ familyGroupId });
  const create = trpc.weekendPlanner.create.useMutation({ onSuccess: async () => { setTitle(""); setDescription(""); await utils.weekendPlanner.list.invalidate({ familyGroupId }); } });
  const share = trpc.weekendPlanner.share.useMutation({ onSuccess: async () => { await Promise.all([utils.weekendPlanner.list.invalidate({ familyGroupId }), utils.familyPoll.list.invalidate({ familyGroupId })]); } });

  return <Card className="border-0 bg-emerald-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex gap-2 text-base"><CalendarDays className="h-5 w-5 text-emerald-600"/>家族の週末プランナー</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例：近所の公園でピクニック" maxLength={160}/><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="集合時刻や、楽しみたいこと" maxLength={500} className="min-h-16 resize-none"/><select value={activityType} onChange={(event) => setActivityType(event.target.value as "indoor" | "outdoor" | "hybrid")} className="h-9 rounded-md border bg-white px-3 text-sm"><option value="indoor">室内</option><option value="outdoor">屋外</option><option value="hybrid">どちらでも</option></select><Button size="sm" disabled={!title.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, title, description, activityType })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Plus className="mr-1 h-4 w-4"/>}候補を追加</Button></div>{isLoading && <p className="py-3 text-center text-xs text-emerald-700">候補を読み込み中です…</p>}{isError && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">候補を取得できませんでした。時間をおいて再度お試しください。</p>}{!isLoading && !isError && plans.length === 0 && <p className="rounded-xl border border-dashed border-emerald-200 bg-white/70 p-4 text-center text-xs text-emerald-800">まずは家族で楽しみたい週末の案をひとつ追加してみましょう。</p>}{plans.map((plan) => <div key={plan.id} className="rounded-xl bg-white p-3"><div className="flex items-start justify-between gap-2"><div><span className="text-[10px] text-emerald-700">{activityLabels[plan.activityType]}</span><p className="text-sm font-semibold">{plan.title}</p></div>{plan.sharedPollId && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">共有済み</span>}</div>{plan.description && <p className="mt-1 text-xs text-slate-500">{plan.description}</p>}<Button size="sm" variant="outline" className="mt-2 bg-white" disabled={Boolean(plan.sharedPollId) || share.isPending} onClick={() => share.mutate({ familyGroupId, planId: plan.id })}>{share.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <Send className="mr-1 h-4 w-4"/>}{plan.sharedPollId ? "家族に共有済み" : "投票として共有"}</Button></div>)}</CardContent></Card>;
}
