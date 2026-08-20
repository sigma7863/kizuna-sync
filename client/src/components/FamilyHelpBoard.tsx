import { useState } from "react";
import { CheckCircle2, HandHeart, Loader2, Plus, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

export function FamilyHelpBoard({ familyGroupId }: { familyGroupId: number }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const utils = trpc.useUtils();
  const { data: requests = [], isLoading } = trpc.helpBoard.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0, refetchInterval: 30_000 });
  const refresh = () => utils.helpBoard.list.invalidate({ familyGroupId });
  const create = trpc.helpBoard.create.useMutation({ onSuccess: async () => { setTitle(""); setDetail(""); setExpanded(false); await refresh(); toast.success("家族へお願いを共有しました"); }, onError: (error) => toast.error(error.message) });
  const accept = trpc.helpBoard.accept.useMutation({ onSuccess: refresh, onError: (error) => toast.error(error.message) });
  const complete = trpc.helpBoard.complete.useMutation({ onSuccess: async () => { await refresh(); toast.success("おたすけを完了しました"); }, onError: (error) => toast.error(error.message) });

  return (
    <Card className="border-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-md">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div><CardTitle className="flex items-center gap-2 text-base text-slate-800"><HandHeart className="h-5 w-5 text-indigo-500" />家族おたすけボード</CardTitle><p className="mt-1 text-xs text-slate-500">お願いを、できる人がそっと引き受けます。</p></div>
        <Button size="sm" onClick={() => setExpanded((value) => !value)}><Plus className="mr-1 h-4 w-4" />お願い</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {expanded && <div className="space-y-2 rounded-2xl bg-white p-3 shadow-sm"><Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="例：買い物をお願いしたい" /><Textarea value={detail} onChange={(event) => setDetail(event.target.value)} maxLength={500} rows={2} placeholder="補足（任意）" /><Button className="w-full" disabled={!title.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, title, detail: detail || undefined })}>{create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HandHeart className="mr-2 h-4 w-4" />}共有する</Button></div>}
        {isLoading ? <div className="flex items-center justify-center py-7 text-xs text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />読み込み中…</div> : requests.length === 0 ? <p className="rounded-xl border border-dashed border-indigo-200 p-4 text-center text-xs text-slate-500">いまお願いはありません。助けが必要なときに気軽に共有できます。</p> : <div className="space-y-2">{requests.slice(0, 5).map((request) => <div key={request.id} className="rounded-xl bg-white/85 p-3 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-slate-800">{request.title}</p>{request.detail && <p className="mt-1 text-xs text-slate-500">{request.detail}</p>}</div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${request.status === "completed" ? "bg-emerald-100 text-emerald-700" : request.status === "accepted" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}>{request.status === "open" ? "募集中" : request.status === "accepted" ? "対応中" : "完了"}</span></div>{request.status === "open" && <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={() => accept.mutate({ familyGroupId, requestId: request.id })}><UserRoundCheck className="mr-1 h-3.5 w-3.5" />引き受ける</Button>}{request.status === "accepted" && <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={() => complete.mutate({ familyGroupId, requestId: request.id })}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />完了にする</Button>}</div>)}</div>}
      </CardContent>
    </Card>
  );
}
