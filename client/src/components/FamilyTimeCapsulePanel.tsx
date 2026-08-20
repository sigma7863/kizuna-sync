import { useState } from "react";
import { CalendarClock, LockKeyhole, Loader2, Send, UnlockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

function defaultOpeningTime() { const date = new Date(Date.now() + 24 * 60 * 60 * 1000); return date.toISOString().slice(0, 16); }

export function FamilyTimeCapsulePanel({ familyGroupId }: { familyGroupId: number }) {
  const [title, setTitle] = useState(""); const [message, setMessage] = useState(""); const [opensAt, setOpensAt] = useState(defaultOpeningTime);
  const utils = trpc.useUtils();
  const { data: capsules = [], isLoading } = trpc.timeCapsule.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0, refetchInterval: 60_000 });
  const create = trpc.timeCapsule.create.useMutation({ onSuccess: async () => { setTitle(""); setMessage(""); setOpensAt(defaultOpeningTime()); await utils.timeCapsule.list.invalidate({ familyGroupId }); toast.success("未来へメッセージを預けました"); }, onError: (error) => toast.error(error.message) });
  return <Card className="border-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-slate-800"><LockKeyhole className="h-5 w-5 text-violet-600" />思い出タイムカプセル</CardTitle><p className="text-xs text-slate-500">公開日に、家族全員へメッセージを届けます。</p></CardHeader><CardContent className="space-y-3"><div className="space-y-2 rounded-2xl bg-white p-3 shadow-sm"><Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="タイトル（例：来年の私たちへ）" /><Textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} rows={3} placeholder="未来の家族へ残すメッセージ" /><label className="block text-xs text-slate-600">公開日時<Input type="datetime-local" value={opensAt} onChange={(event) => setOpensAt(event.target.value)} className="mt-1" /></label><Button className="w-full bg-violet-600 hover:bg-violet-700" disabled={!title.trim() || !message.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, title, message, opensAt: new Date(opensAt).toISOString() })}>{create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}未来へ預ける</Button></div>{isLoading ? <div className="flex justify-center py-4 text-xs text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />読み込み中…</div> : <div className="space-y-2">{capsules.slice(0, 4).map((capsule) => <div key={capsule.id} className="rounded-xl bg-white/85 p-3 shadow-sm"><div className="flex items-center gap-2"><span className="rounded-full bg-violet-100 p-1.5 text-violet-600">{capsule.openedAt ? <UnlockKeyhole className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}</span><div><p className="text-sm font-semibold text-slate-800">{capsule.title}</p><p className="text-[10px] text-slate-500">{capsule.openedAt ? "公開済み" : `${new Date(capsule.opensAt).toLocaleString()}に公開`}</p></div></div>{capsule.openedAt && <p className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{capsule.message}</p>}</div>)}</div>}</CardContent></Card>;
}
