import { useEffect, useState } from "react";
import { Contrast, Eye, Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDisplayScalePercent, type DisplayScale } from "@shared/familyAccessibility";

type DisplayPreferences = { scale: DisplayScale; highContrast: boolean; reduceMotion: boolean };
const storageKey = "kizunasync-display-preferences";
const defaultPreferences: DisplayPreferences = { scale: "standard", highContrast: false, reduceMotion: false };

export function FamilyDisplaySettings() {
  const [preferences, setPreferences] = useState<DisplayPreferences>(defaultPreferences);
  useEffect(() => { try { const stored = window.localStorage.getItem(storageKey); if (stored) setPreferences({ ...defaultPreferences, ...JSON.parse(stored) }); } catch { /* keep safe defaults */ } }, []);
  useEffect(() => { const root = document.documentElement; root.style.fontSize = `${getDisplayScalePercent(preferences.scale)}%`; root.classList.toggle("a11y-high-contrast", preferences.highContrast); root.classList.toggle("a11y-reduced-motion", preferences.reduceMotion); try { window.localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { /* settings remain for this visit */ } }, [preferences]);
  const update = (patch: Partial<DisplayPreferences>) => setPreferences((current) => ({ ...current, ...patch }));
  return <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-cyan-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Eye className="h-5 w-5 text-cyan-700"/>やさしい表示設定</CardTitle><p className="text-xs text-slate-500">この端末で、見やすさと動きの量を選べます。</p></CardHeader><CardContent className="space-y-3"><div><p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700"><Type className="h-3.5 w-3.5"/>文字の大きさ</p><div className="grid grid-cols-3 gap-1.5">{(["standard", "large", "xlarge"] as DisplayScale[]).map((scale) => <button key={scale} type="button" onClick={() => update({ scale })} className={`rounded-lg px-2 py-2 text-xs ${preferences.scale === scale ? "bg-cyan-700 text-white" : "bg-white text-slate-700 shadow-sm"}`}>{scale === "standard" ? "標準" : scale === "large" ? "大きめ" : "最大"}</button>)}</div></div><button type="button" onClick={() => update({ highContrast: !preferences.highContrast })} className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs ${preferences.highContrast ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-sm"}`}><span className="flex items-center gap-2"><Contrast className="h-4 w-4"/>高コントラスト</span><span>{preferences.highContrast ? "オン" : "オフ"}</span></button><button type="button" onClick={() => update({ reduceMotion: !preferences.reduceMotion })} className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs ${preferences.reduceMotion ? "bg-slate-800 text-white" : "bg-white text-slate-700 shadow-sm"}`}><span>動きを控えめにする</span><span>{preferences.reduceMotion ? "オン" : "オフ"}</span></button></CardContent></Card>;
}
