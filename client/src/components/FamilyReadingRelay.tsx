import { useState } from "react";
import { BookOpen, Loader2, Plus, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getReadingRelaySummary } from "@shared/familyDailyCheckins";

export function FamilyReadingRelay({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [bookTitle, setBookTitle] = useState(""); const [pageCount, setPageCount] = useState(""); const [quote, setQuote] = useState(""); const [reflection, setReflection] = useState("");
  const { data: entries = [], isLoading } = trpc.readingRelay.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.readingRelay.create.useMutation({ onSuccess: async () => { setBookTitle(""); setPageCount(""); setQuote(""); setReflection(""); await utils.readingRelay.list.invalidate({ familyGroupId }); } });
  const summary = getReadingRelaySummary(entries);
  return <Card className="border-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-5 w-5 text-amber-600"/>家族の読書リレー</CardTitle><p className="text-xs text-slate-500">読んだページや心に残った言葉を、次の人へつなごう。</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-2"><Input value={bookTitle} onChange={(event) => setBookTitle(event.target.value)} placeholder="本のタイトル" maxLength={180}/><Input type="number" min="1" value={pageCount} onChange={(event) => setPageCount(event.target.value)} placeholder="頁"/></div><Input value={quote} onChange={(event) => setQuote(event.target.value)} placeholder="心に残った言葉（任意）" maxLength={300}/><Textarea value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="ひとこと（任意）" maxLength={300} className="min-h-16"/><Button size="sm" disabled={!bookTitle.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, bookTitle, pageCount: pageCount ? Number(pageCount) : undefined, quote, reflection })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>リレーに渡す</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-amber-700">読書リレーを読み込み中です…</p> : <><p className="text-xs text-amber-700">みんなで {summary.entries} 件 · {summary.pages} ページ</p><div className="grid gap-2">{entries.slice(0, 5).map((entry) => <article key={entry.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-sm font-semibold text-slate-800">{entry.bookTitle}{entry.pageCount ? ` · ${entry.pageCount}頁` : ""}</p>{entry.quote && <p className="mt-2 flex gap-1 text-xs italic text-amber-800"><Quote className="h-3.5 w-3.5 shrink-0"/>{entry.quote}</p>}{entry.reflection && <p className="mt-1 text-xs text-slate-600">{entry.reflection}</p>}</article>)}{entries.length === 0 && <p className="rounded-xl border border-dashed border-amber-200 p-3 text-center text-xs text-slate-500">本の一節や小さな発見を、最初に渡してみましょう。</p>}</div></>}</CardContent></Card>;
}
