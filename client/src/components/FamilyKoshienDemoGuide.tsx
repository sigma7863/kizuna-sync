import { Accessibility, Gauge, Languages, PlayCircle, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useI18n } from "@/contexts/I18nContext";
import { getKoshienDemoSteps } from "@shared/koshienDemo";

const stepKeys = {
  create: "family.demoStepCreate",
  safety: "family.demoStepSafety",
  checkIn: "family.demoStepCheckIn",
  memory: "family.demoStepMemory",
  recovery: "family.demoStepRecovery",
} as const;

export function FamilyKoshienDemoGuide({ familyGroupId, onNavigate }: { familyGroupId: number; onNavigate: (path: string) => void }) {
  const { t } = useI18n();
  const steps = getKoshienDemoSteps(familyGroupId);

  return <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className="min-h-11 gap-1.5 border-violet-300 bg-violet-50 text-violet-950 hover:bg-violet-100"><PlayCircle className="h-4 w-4" aria-hidden="true" />{t("family.demoOpen")}</Button>
    </DialogTrigger>
    <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto" aria-describedby="koshien-demo-description">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl text-violet-950"><PlayCircle className="h-6 w-6 text-violet-700" aria-hidden="true" />{t("family.demoTitle")}</DialogTitle>
        <DialogDescription id="koshien-demo-description" className="leading-relaxed text-slate-700">{t("family.demoDescription")}</DialogDescription>
      </DialogHeader>
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-sm text-amber-950" role="note"><p className="flex items-center gap-1.5 font-bold"><ShieldCheck className="h-4 w-4" aria-hidden="true" />{t("family.demoSafetyTitle")}</p><p className="mt-1 leading-relaxed">{t("family.demoSafetyDescription")}</p></div>
      <ol className="space-y-2" aria-label={t("family.demoStepsTitle")}>
        {steps.map((step, index) => <li key={step.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-700 text-sm font-bold text-white" aria-hidden="true">{index + 1}</span><Button type="button" variant="ghost" className="h-auto min-h-11 flex-1 justify-start whitespace-normal px-1 text-left font-semibold text-slate-900 hover:bg-violet-50" onClick={() => onNavigate(step.path)}>{t(stepKeys[step.id])}</Button></li>)}
      </ol>
      <section aria-labelledby="koshien-demo-value-title"><h3 id="koshien-demo-value-title" className="text-sm font-bold text-slate-900">{t("family.demoValueTitle")}</h3><div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold"><p className="rounded-lg bg-rose-50 p-2 text-rose-950"><ShieldCheck className="mb-1 h-4 w-4" aria-hidden="true" />{t("family.demoValuePrivacy")}</p><p className="rounded-lg bg-sky-50 p-2 text-sky-950"><Languages className="mb-1 h-4 w-4" aria-hidden="true" />{t("family.demoValueLanguage")}</p><p className="rounded-lg bg-emerald-50 p-2 text-emerald-950"><Accessibility className="mb-1 h-4 w-4" aria-hidden="true" />{t("family.demoValueAccessibility")}</p><p className="rounded-lg bg-amber-50 p-2 text-amber-950"><Gauge className="mb-1 h-4 w-4" aria-hidden="true" />{t("family.demoValuePerformance")}</p></div></section>
      <DialogFooter><Button type="button" variant="outline" className="min-h-11" onClick={() => onNavigate(`/family/${familyGroupId}?tab=timeline`)}><RotateCcw className="mr-1.5 h-4 w-4" />{t("family.demoReset")}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
