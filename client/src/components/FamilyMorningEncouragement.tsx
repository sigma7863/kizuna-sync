import { useState } from "react";
import { Loader2, Send, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function FamilyMorningEncouragement({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [message, setMessage] = useState("");
  const { data: messages = [], isLoading } = trpc.morningEncouragements.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.morningEncouragements.create.useMutation({ onSuccess: async () => { setMessage(""); await utils.morningEncouragements.list.invalidate({ familyGroupId }); } });
  return <Card className="border-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Sun className="h-5 w-5 text-amber-600"/>家族の朝の励ましひとこと</CardTitle><p className="text-xs text-slate-500">出発前の短い応援で、一日の安心をつくろう。</p></CardHeader><CardContent className="space-y-3"><div className="flex gap-2 rounded-xl bg-white/80 p-3"><Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="例：今日も自分のペースでね" maxLength={180}/><Button size="icon" aria-label="励ましを送る" disabled={!message.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, message })}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-amber-700">励ましを読み込み中です…</p> : <div className="grid gap-2">{messages.slice(0, 4).map((entry) => <article key={entry.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="flex gap-1 text-sm text-slate-800"><Sun className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"/>{entry.message}</p></article>)}{messages.length === 0 && <p className="rounded-xl border border-dashed border-amber-200 p-3 text-center text-xs text-slate-500">家族が今日を始めやすくなるひとことを残しましょう。</p>}</div>}</CardContent></Card>;
}
