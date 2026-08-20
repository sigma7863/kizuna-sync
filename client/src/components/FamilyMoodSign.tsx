import { useState } from "react";
import { HeartPulse, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

const signs = [
  { value: "sunny", label: "元気", color: "bg-amber-100 text-amber-800" },
  { value: "calm", label: "穏やか", color: "bg-sky-100 text-sky-800" },
  { value: "tired", label: "疲れ気味", color: "bg-slate-100 text-slate-700" },
  { value: "need_support", label: "話したい", color: "bg-rose-100 text-rose-800" },
];

export function FamilyMoodSign({ familyGroupId }: { familyGroupId: number }) {
  const [selected, setSelected] = useState(signs[0].value);
  const [note, setNote] = useState("");
  const utils = trpc.useUtils();
  const createEntry = trpc.timeline.createEntry.useMutation({ onSuccess: async () => { setNote(""); await utils.timeline.getFamilyTimeline.invalidate({ familyGroupId, limit: 50 }); } });
  const active = signs.find((sign) => sign.value === selected) ?? signs[0];
  return <Card className="border-0 bg-gradient-to-br from-rose-50 via-white to-orange-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><HeartPulse className="h-5 w-5 text-rose-600"/>家族の気分サイン</CardTitle><p className="text-xs text-slate-500">今日の気分をそっと共有して、声をかけるきっかけに。</p></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-2">{signs.map((sign) => <button key={sign.value} type="button" onClick={() => setSelected(sign.value)} className={`rounded-full px-3 py-1.5 text-xs transition ${selected === sign.value ? sign.color + " ring-2 ring-rose-300" : "bg-white text-slate-600 shadow-sm"}`}>{sign.label}</button>)}</div><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="ひとこと（任意）" maxLength={120}/><Button size="sm" className="w-full" disabled={createEntry.isPending} onClick={() => createEntry.mutate({ familyGroupId, entryType: "mood", content: `${active.label}${note.trim() ? `：${note.trim()}` : ""}`, metadata: { moodSign: selected, moodLabel: active.label } })}>{createEntry.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <HeartPulse className="mr-1 h-4 w-4"/>}気分を共有する</Button></CardContent></Card>;
}
