import { CheckCircle2, HandHeart, ShoppingBasket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { buildFamilyDailySupportSummary, type FamilyDailySupportRole } from "@shared/familyDailySupport";

const actionKeys = {
  coordinate: "family.dailySupportActionGuardian",
  contribute: "family.dailySupportActionChild",
  rest: "family.dailySupportActionElderly",
} as const;

export function FamilyDailySupportSummary({ familyGroupId, role, onOpenCheckIn }: { familyGroupId: number; role: FamilyDailySupportRole; onOpenCheckIn: () => void }) {
  const { t } = useI18n();
  const { data: shoppingItems = [] } = trpc.shopping.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: helpRequests = [] } = trpc.helpBoard.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const summary = buildFamilyDailySupportSummary(role, { shoppingItems, helpRequests });
  return <Card className="border-0 bg-gradient-to-br from-amber-50 via-white to-rose-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-amber-950"><Sparkles className="h-5 w-5 text-amber-600" aria-hidden="true" />{t("family.dailySupportTitle")}</CardTitle><p className="text-xs leading-relaxed text-slate-600">{t("family.dailySupportDescription")}</p></CardHeader><CardContent className="space-y-3"><p className="rounded-xl bg-white/85 px-3 py-2 text-sm font-semibold text-amber-900">{t(actionKeys[summary.action])}</p><div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-white/85 p-2"><ShoppingBasket className="mx-auto h-4 w-4 text-lime-600" aria-hidden="true" /><p className="mt-1 text-lg font-bold text-slate-800">{summary.openShoppingCount}</p><p className="text-[10px] text-slate-500">{t("family.dailySupportShopping")}</p></div><div className="rounded-xl bg-white/85 p-2"><HandHeart className="mx-auto h-4 w-4 text-indigo-600" aria-hidden="true" /><p className="mt-1 text-lg font-bold text-slate-800">{summary.openHelpCount}</p><p className="text-[10px] text-slate-500">{t("family.dailySupportHelp")}</p></div><div className="rounded-xl bg-white/85 p-2"><CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" aria-hidden="true" /><p className="mt-1 text-lg font-bold text-slate-800">{summary.completedCount}</p><p className="text-[10px] text-slate-500">{t("family.dailySupportCompleted")}</p></div></div><Button type="button" variant="outline" size="sm" className="w-full border-amber-200 bg-white text-amber-900 hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-600" onClick={onOpenCheckIn}>{t("family.dailySupportCheckIn")}</Button><p className="text-center text-[11px] leading-relaxed text-slate-500">{t("family.dailySupportCheckInHelp")}</p></CardContent></Card>;
}
