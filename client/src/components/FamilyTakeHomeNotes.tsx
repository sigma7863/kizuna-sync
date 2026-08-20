import { useState } from "react";
import { CheckCircle2, Loader2, NotebookPen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getTakeHomeCategoryLabel, type TakeHomeCategory } from "@shared/familyDailyRhythm";

export function FamilyTakeHomeNotes({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<TakeHomeCategory>("school");
  const { data: notes = [], isLoading } = trpc.takeHomeNotes.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.takeHomeNotes.create.useMutation({ onSuccess: async () => { setTitle(""); setContent(""); setCategory("school"); await utils.takeHomeNotes.list.invalidate({ familyGroupId }); } });
  const toggle = trpc.takeHomeNotes.toggleResolved.useMutation({ onSuccess: () => utils.takeHomeNotes.list.invalidate({ familyGroupId }) });

  return <Card className="border-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><NotebookPen className="h-5 w-5 text-sky-600"/>家族の持ち帰りメモ</CardTitle><p className="text-xs text-slate-500">学校・仕事・外出先で気づいたことを、帰ってから共有。</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="メモのタイトル" maxLength={160}/><select value={category} onChange={(event) => setCategory(event.target.value as TakeHomeCategory)} className="h-9 rounded-md border bg-white px-2 text-sm"><option value="school">学校</option><option value="work">仕事</option><option value="outing">外出</option><option value="other">くらし</option></select></div><Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="共有したいこと・頼まれたこと" maxLength={500} className="min-h-20"/><Button size="sm" disabled={!title.trim() || !content.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, title, content, category })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>メモを渡す</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-sky-700">メモを読み込み中です…</p> : <div className="grid gap-2">{notes.map((note) => <article key={note.id} className={`rounded-xl p-3 shadow-sm ${note.isResolved ? "bg-slate-50" : "bg-white"}`}><div className="flex items-start justify-between gap-2"><div><p className={`text-sm font-semibold ${note.isResolved ? "text-slate-500 line-through" : "text-slate-800"}`}>{note.title}</p><p className="mt-0.5 text-[11px] text-sky-700">{getTakeHomeCategoryLabel(note.category)}</p></div><button type="button" aria-label={note.isResolved ? "未解決に戻す" : "確認済みにする"} disabled={toggle.isPending} onClick={() => toggle.mutate({ familyGroupId, noteId: note.id, isResolved: !note.isResolved })} className={`rounded-full p-1.5 ${note.isResolved ? "text-emerald-600" : "text-slate-400"}`}><CheckCircle2 className="h-5 w-5"/></button></div><p className={`mt-2 text-xs leading-relaxed ${note.isResolved ? "text-slate-400" : "text-slate-600"}`}>{note.content}</p></article>)}{notes.length === 0 && <p className="rounded-xl border border-dashed border-sky-200 p-3 text-center text-xs text-slate-500">帰ってから話したいことを、気軽にメモしてみましょう。</p>}</div>}</CardContent></Card>;
}
