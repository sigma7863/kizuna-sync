import { useMemo, useState } from "react";
import { HandHeart, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { parseFamilyStrengths } from "@shared/familyCollaboration";

const roleLabel = { guardian: "保護者", child: "子ども", elderly: "高齢者" } as const;

export function FamilyRoleMap({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [skillsText, setSkillsText] = useState("");
  const [supportNote, setSupportNote] = useState("");
  const { data: members = [], isLoading, isError } = trpc.roleMap.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const skills = useMemo(() => parseFamilyStrengths(skillsText), [skillsText]);
  const saveMine = trpc.roleMap.saveMine.useMutation({ onSuccess: () => utils.roleMap.list.invalidate({ familyGroupId }) });
  return <Card className="border-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><HandHeart className="h-5 w-5 text-violet-600"/>家族の役割マップ</CardTitle><p className="text-xs text-slate-500">得意なことを知れば、頼みごとももっとやさしく。</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><Input value={skillsText} onChange={(event) => setSkillsText(event.target.value)} placeholder="得意なこと（例：料理、聞き役、機械）" maxLength={280}/><Textarea value={supportNote} onChange={(event) => setSupportNote(event.target.value)} placeholder="こんなときは頼ってね（任意）" maxLength={240} className="min-h-16 resize-none"/><Button size="sm" disabled={skills.length === 0 || saveMine.isPending} onClick={() => saveMine.mutate({ familyGroupId, strengths: skills, supportNote })}>{saveMine.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Save className="mr-1 h-4 w-4"/>自分の役割を保存</>}</Button></div>{isLoading && <p className="py-3 text-center text-xs text-violet-700">役割マップを読み込み中です…</p>}{isError && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">役割マップを取得できませんでした。</p>}{!isLoading && !isError && <div className="grid gap-2">{members.map((member) => <div key={member.userId} className="rounded-xl bg-white p-3 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-800">{member.name}</p><span className="text-[10px] text-violet-700">{roleLabel[member.memberRole]}</span></div>{member.strengths.length > 0 ? <div className="mt-2 flex flex-wrap gap-1.5">{member.strengths.map((skill) => <span key={skill} className="rounded-full bg-violet-100 px-2 py-1 text-[11px] text-violet-800"><Sparkles className="mr-0.5 inline h-3 w-3"/>{skill}</span>)}</div> : <p className="mt-2 text-xs text-slate-400">まだ得意なことを登録していません。</p>}{member.supportNote && <p className="mt-2 text-xs text-slate-600">{member.supportNote}</p>}</div>)}{members.length === 0 && <p className="rounded-xl border border-dashed border-violet-200 p-3 text-center text-xs text-slate-500">家族メンバーがそろうと役割マップを作れます。</p>}</div>}</CardContent></Card>;
}
