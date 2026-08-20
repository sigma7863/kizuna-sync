import { useState } from "react";
import { CalendarDays, Loader2, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { isFamilyEventPoll } from "@shared/familyMemories";

export function FamilyEventVote({ familyGroupId }: { familyGroupId: number }) {
  const [title, setTitle] = useState(""); const [first, setFirst] = useState(""); const [second, setSecond] = useState("");
  const utils = trpc.useUtils();
  const { data: polls = [] } = trpc.familyPoll.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0, refetchInterval: 30_000 });
  const eventPolls = polls.filter((poll) => isFamilyEventPoll(poll.question));
  const create = trpc.familyPoll.create.useMutation({ onSuccess: async () => { setTitle(""); setFirst(""); setSecond(""); await utils.familyPoll.list.invalidate({ familyGroupId }); toast.success("イベント候補を家族へ共有しました"); }, onError: (error) => toast.error(error.message) });
  const answer = trpc.familyPoll.answer.useMutation({ onSuccess: () => utils.familyPoll.list.invalidate({ familyGroupId }), onError: (error) => toast.error(error.message) });
  return <Card className="border-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-slate-800"><CalendarDays className="h-5 w-5 text-orange-500" />家族イベント投票</CardTitle><p className="text-xs text-slate-500">候補日や場所から、みんなが集まりやすい案を選ぼう。</p></CardHeader><CardContent className="space-y-3"><div className="space-y-2 rounded-2xl bg-white p-3 shadow-sm"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例：秋のピクニック" maxLength={120} /><div className="flex gap-2"><Input value={first} onChange={(event) => setFirst(event.target.value)} placeholder="候補A：土曜の公園" maxLength={80} /><Input value={second} onChange={(event) => setSecond(event.target.value)} placeholder="候補B：日曜の水族館" maxLength={80} /></div><Button className="w-full bg-orange-500 hover:bg-orange-600" disabled={!title.trim() || !first.trim() || !second.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, question: `イベント：${title}`, options: [first, second], endsAt: new Date(Date.now() + 5 * 86400000).toISOString() })}>{create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}候補を出す</Button></div><div className="space-y-2">{eventPolls.slice(0, 2).map((poll) => <div key={poll.id} className="rounded-xl bg-white/85 p-3 shadow-sm"><p className="text-sm font-semibold text-slate-800">{poll.question.replace("イベント：", "")}</p>{poll.options.map((option, index) => { const percent = poll.responseCount ? Math.round(poll.counts[index] * 100 / poll.responseCount) : 0; return <button key={option} type="button" disabled={poll.ownOptionIndex !== null} onClick={() => answer.mutate({ pollId: poll.id, optionIndex: index })} className={`mt-2 w-full rounded-lg p-2 text-left text-xs ${poll.ownOptionIndex === index ? "bg-orange-100" : "bg-orange-50 hover:bg-orange-100"}`}><span className="flex items-center justify-between"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{option}</span><span>{percent}%</span></span><Progress value={percent} className="mt-1.5 h-1.5" /></button>; })}</div>)}{eventPolls.length === 0 && <p className="rounded-xl border border-dashed border-orange-200 p-3 text-center text-xs text-slate-500">次の家族イベントの候補を出してみましょう。</p>}</div></CardContent></Card>;
}
