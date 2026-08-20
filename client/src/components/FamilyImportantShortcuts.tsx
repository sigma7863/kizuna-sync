import { CalendarDays, HeartPulse, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FamilyImportantShortcuts({ onSafety, onMood, onDaily }: { onSafety: () => void; onMood: () => void; onDaily: () => void }) {
  const shortcuts = [
    { label: "安心を確認", detail: "家族の安全・見守り", icon: ShieldCheck, onClick: onSafety, tone: "bg-emerald-50 text-emerald-800" },
    { label: "今日の気分", detail: "ひとことを伝える", icon: HeartPulse, onClick: onMood, tone: "bg-pink-50 text-pink-800" },
    { label: "今日の予定", detail: "楽しみ・持ち物を見る", icon: CalendarDays, onClick: onDaily, tone: "bg-amber-50 text-amber-800" },
  ];
  return <Card className="border-0 bg-gradient-to-br from-amber-50 via-white to-emerald-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="text-base">家族の大切カード</CardTitle><p className="text-xs text-slate-500">急ぎたいときに、まずここから開けます。</p></CardHeader><CardContent className="grid grid-cols-3 gap-2">{shortcuts.map((shortcut) => { const Icon = shortcut.icon; return <button key={shortcut.label} type="button" onClick={shortcut.onClick} className={`min-h-24 rounded-xl p-2 text-left transition active:scale-[0.98] ${shortcut.tone}`}><Icon className="h-5 w-5"/><span className="mt-2 block text-xs font-semibold">{shortcut.label}</span><span className="mt-1 block text-[10px] leading-tight opacity-80">{shortcut.detail}</span></button>; })}</CardContent></Card>;
}
