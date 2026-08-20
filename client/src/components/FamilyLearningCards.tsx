import { useState } from "react";
import { BookOpenCheck, GraduationCap, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLearningSourceLabel, type LearningSourceType } from "@shared/familyWellness";

const sourceOptions: Array<{ value: LearningSourceType; label: string }> = [
  { value: "book", label: "本" }, { value: "school", label: "学校" }, { value: "work", label: "仕事" }, { value: "other", label: "くらし" },
];

export function FamilyLearningCards({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [sourceType, setSourceType] = useState<LearningSourceType>("book");
  const [insight, setInsight] = useState("");
  const { data: cards = [], isLoading } = trpc.learningCards.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.learningCards.create.useMutation({
    onSuccess: async () => { setTitle(""); setSource(""); setSourceType("book"); setInsight(""); await utils.learningCards.list.invalidate({ familyGroupId }); },
  });

  return <Card className="border-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><GraduationCap className="h-5 w-5 text-violet-600"/>学びシェアカード</CardTitle><p className="text-xs text-slate-500">本・学校・仕事で見つけた小さな発見を交換。</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="学びのタイトル" maxLength={160}/><div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2"><Input value={source} onChange={(event) => setSource(event.target.value)} placeholder="きっかけ・作品名（任意）" maxLength={180}/><select value={sourceType} onChange={(event) => setSourceType(event.target.value as LearningSourceType)} className="h-9 rounded-md border bg-white px-2 text-sm">{sourceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div><Textarea value={insight} onChange={(event) => setInsight(event.target.value)} placeholder="どんなことを学んだ？" maxLength={500} className="min-h-20"/><Button size="sm" disabled={!title.trim() || !insight.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, title, source, sourceType, insight })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>学びを渡す</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-violet-700">学びカードを読み込み中です…</p> : <div className="grid gap-2">{cards.map((card) => <article key={card.id} className="rounded-xl bg-white p-3 shadow-sm"><div className="flex items-start gap-2"><BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-600"/><div><p className="text-sm font-semibold text-slate-800">{card.title}</p><p className="mt-0.5 text-[11px] text-violet-700">{getLearningSourceLabel(card.sourceType)}{card.source ? ` · ${card.source}` : ""}</p></div></div><p className="mt-2 text-xs leading-relaxed text-slate-600">{card.insight}</p></article>)}{cards.length === 0 && <p className="rounded-xl border border-dashed border-violet-200 p-3 text-center text-xs text-slate-500">今日見つけた小さな学びを、家族に渡してみましょう。</p>}</div>}</CardContent></Card>;
}
