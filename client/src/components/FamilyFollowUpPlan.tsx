import { useEffect, useState } from "react";
import { BellRing, Droplets, HeartHandshake, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n, type Language } from "@/contexts/I18nContext";
import { familyFollowUpChoices, getFamilyFollowUpStorageKey, isFamilyFollowUpChoice, type FamilyFollowUpChoice } from "@shared/familyFollowUp";

const copy: Record<Language, Record<string, string>> = {
  ja: { title: "このあと自分のためにすること", description: "これは家族へ送信されません。自分の端末にだけ残すかを選べます。", rest: "少し休む", water: "水分をとる", contact: "必要なら家族へ連絡する", save: "この端末に残す", remove: "端末から消去", saved: "この端末だけに保存しました。", local: "家族には共有しません" },
  en: { title: "What I will do next", description: "This is not sent to family. Choose whether to keep it on this device only.", rest: "Take a short rest", water: "Drink water", contact: "Contact family if needed", save: "Keep on this device", remove: "Remove from device", saved: "Saved on this device only.", local: "Not shared with family" },
  zh: { title: "接下来为自己做什么", description: "不会发送给家人。您可以选择只保留在此设备上。", rest: "稍作休息", water: "补充水分", contact: "需要时联系家人", save: "保留在此设备", remove: "从设备删除", saved: "仅保存在此设备上。", local: "不会与家人共享" },
  ko: { title: "이후에 나를 위해 할 일", description: "가족에게 전송되지 않습니다. 이 기기에만 남길지 선택할 수 있습니다.", rest: "잠시 쉬기", water: "물 마시기", contact: "필요하면 가족에게 연락하기", save: "이 기기에 남기기", remove: "기기에서 삭제", saved: "이 기기에만 저장했습니다.", local: "가족에게 공유하지 않습니다" },
};

export function FamilyFollowUpPlan({ familyGroupId }: { familyGroupId: number }) {
  const { language } = useI18n();
  const t = copy[language];
  const key = getFamilyFollowUpStorageKey(familyGroupId);
  const [choice, setChoice] = useState<FamilyFollowUpChoice>("rest");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { const value = window.localStorage.getItem(key); if (isFamilyFollowUpChoice(value)) { setChoice(value); setSaved(true); } } catch { /* local storage can be unavailable */ }
  }, [key]);
  const save = () => { try { window.localStorage.setItem(key, choice); setSaved(true); } catch { setSaved(false); } };
  const remove = () => { try { window.localStorage.removeItem(key); } finally { setSaved(false); } };
  const icons = { rest: HeartHandshake, water: Droplets, contact: BellRing };

  return <section className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3" aria-labelledby="follow-up-plan-title"><div className="flex items-start justify-between gap-2"><div><h3 id="follow-up-plan-title" className="text-base font-bold text-sky-950">{t.title}</h3><p className="mt-1 text-xs leading-relaxed text-sky-900">{t.description}</p></div><span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-sky-900">{t.local}</span></div><div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t.title}>{familyFollowUpChoices.map((item) => { const Icon = icons[item]; return <button key={item} type="button" role="radio" aria-checked={choice === item} onClick={() => { setChoice(item); setSaved(false); }} className={`min-h-14 rounded-lg border-2 px-3 py-2 text-left text-sm font-bold focus-visible:ring-4 focus-visible:ring-sky-700 ${choice === item ? "border-sky-700 bg-white text-sky-950" : "border-sky-200 bg-sky-50 text-slate-800"}`}><Icon className="mr-1.5 inline h-4 w-4" aria-hidden="true" />{t[item]}</button>; })}</div><div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" onClick={save} className="min-h-11 bg-sky-700 text-white hover:bg-sky-800">{t.save}</Button>{saved && <Button type="button" size="sm" variant="outline" onClick={remove} className="min-h-11 border-sky-700 text-sky-950"><Trash2 className="mr-1 h-4 w-4" />{t.remove}</Button>}<p className="self-center text-xs font-medium text-sky-900" role="status" aria-live="polite">{saved ? t.saved : ""}</p></div></section>;
}
