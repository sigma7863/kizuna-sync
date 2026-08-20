import { useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { tableTopicToneLabels } from "@shared/familyConversationMoments";

type TopicTone = keyof typeof tableTopicToneLabels;
const toneIcons = { laugh: Sparkles, share: MessageCircle, think: MessageCircle };

export function FamilyTableTopic({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [tone, setTone] = useState<TopicTone>("share"); const [topic, setTopic] = useState("");
  const { data: topics = [], isLoading } = trpc.tableTopics.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.tableTopics.create.useMutation({ onSuccess: async () => { setTopic(""); await utils.tableTopics.list.invalidate({ familyGroupId }); } });
  const update = trpc.tableTopics.update.useMutation({ onSuccess: () => utils.tableTopics.list.invalidate({ familyGroupId }) });
  return <Card className="border-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><MessageCircle className="h-5 w-5 text-orange-700"/>家族の食卓トピックカード</CardTitle><p className="text-xs text-slate-500">食事の時間に話したい、軽い話題を一つ用意しよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="grid grid-cols-3 gap-1">{(Object.keys(tableTopicToneLabels) as TopicTone[]).map((key) => { const Icon = toneIcons[key]; return <button key={key} type="button" onClick={() => setTone(key)} className={`rounded-lg px-1 py-2 text-xs transition active:scale-95 ${tone === key ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-800"}`}><Icon className="mr-1 inline h-3.5 w-3.5"/>{tableTopicToneLabels[key]}</button>; })}</div><div className="mt-2 flex gap-2"><Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="例：最近見つけた面白いことは？" maxLength={180}/><Button size="sm" disabled={!topic.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, tone, topic })}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>置く</>}</Button></div></div>{isLoading ? <p className="py-3 text-center text-xs text-orange-700">話題を読み込み中です…</p> : <div className="grid gap-2">{topics.map((entry) => <article key={entry.id} className={`rounded-xl p-3 shadow-sm ${entry.isDiscussed ? "bg-orange-50" : "bg-white"}`}><div className="flex items-start justify-between gap-2"><div><p className="text-[11px] font-medium text-orange-800">{tableTopicToneLabels[entry.tone]}</p><p className={`mt-1 text-sm ${entry.isDiscussed ? "text-orange-700 line-through" : "font-semibold text-slate-800"}`}>{entry.topic}</p></div><button type="button" aria-label={entry.isDiscussed ? "未実施に戻す" : "話せた"} onClick={() => update.mutate({ familyGroupId, topicId: entry.id, isDiscussed: !entry.isDiscussed })} className={entry.isDiscussed ? "text-emerald-600" : "text-slate-400"}><CheckCircle2 className="h-5 w-5"/></button></div></article>)}{topics.length === 0 && <p className="rounded-xl border border-dashed border-orange-200 p-3 text-center text-xs text-slate-500">次の食事で話してみたいことを、一つ置いてみましょう。</p>}</div>}</CardContent></Card>;
}
