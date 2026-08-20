import { BarChart3, CircleHelp, Heart, Images, MapPinned, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoleQuickActions, type FamilyMemberRole, type QuickHubAction } from "@shared/familyAccessibility";

const actionMeta: Record<QuickHubAction, { label: string; detail: string; icon: typeof ShieldCheck; tone: string }> = {
  safety: { label: "安心を確認", detail: "見守り・安全情報へ", icon: ShieldCheck, tone: "text-emerald-700 bg-emerald-50" },
  assistant: { label: "家族AIに相談", detail: "言葉でやさしく案内", icon: CircleHelp, tone: "text-indigo-700 bg-indigo-50" },
  album: { label: "思い出を見る", detail: "家族アルバムへ", icon: Images, tone: "text-sky-700 bg-sky-50" },
  shareMood: { label: "気分を伝える", detail: "今日のひとことへ", icon: Heart, tone: "text-pink-700 bg-pink-50" },
  stats: { label: "家族の様子", detail: "つながりの記録へ", icon: BarChart3, tone: "text-violet-700 bg-violet-50" },
};
const roleLabel: Record<FamilyMemberRole, string> = { guardian: "見守り役", child: "子ども", elderly: "シニア" };

export function FamilyRoleQuickHub({ role, onAction }: { role: FamilyMemberRole; onAction: (action: QuickHubAction) => void }) {
  return <Card className="border-0 bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><MapPinned className="h-5 w-5 text-indigo-600"/>あなた向けのクイックハブ</CardTitle><p className="text-xs text-slate-500">{roleLabel[role]}の使いやすさに合わせた、よく使う入口です。</p></CardHeader><CardContent className="grid grid-cols-3 gap-2">{getRoleQuickActions(role).map((action) => { const meta = actionMeta[action]; const Icon = meta.icon; return <button key={action} type="button" onClick={() => onAction(action)} className={`min-h-24 rounded-xl p-2 text-left transition active:scale-[0.98] ${meta.tone}`}><Icon className="h-5 w-5"/><span className="mt-2 block text-xs font-semibold">{meta.label}</span><span className="mt-1 block text-[10px] leading-tight opacity-80">{meta.detail}</span></button>; })}</CardContent></Card>;
}
