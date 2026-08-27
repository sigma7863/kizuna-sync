import { ArrowDown, ArrowUp, Eye, EyeOff, ListRestart, Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FamilyFeatureLayout } from "@shared/familyFeatureLayout";
import type { FamilyDetailTab } from "@shared/familyDetailTabs";

interface FamilyFeatureOrganizerProps {
  layout: FamilyFeatureLayout;
  labels: Record<FamilyDetailTab, string>;
  isSaving: boolean;
  onMove: (tab: FamilyDetailTab, direction: "up" | "down") => void;
  onToggleVisibility: (tab: FamilyDetailTab) => void;
  onReset: () => void;
}

export function FamilyFeatureOrganizer({ layout, labels, isSaving, onMove, onToggleVisibility, onReset }: FamilyFeatureOrganizerProps) {
  return (
    <section className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 shadow-sm" aria-labelledby="family-feature-organizer-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="family-feature-organizer-title" className="flex items-center gap-2 font-semibold text-indigo-950"><SlidersHorizontal className="h-4 w-4" />家族機能の整理</h2>
          <p className="mt-1 text-sm text-indigo-800">この家族で共有する機能タブの表示と順番を整えます。</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onReset} disabled={isSaving}>
          <ListRestart className="mr-1.5 h-4 w-4" />既定に戻す
        </Button>
      </div>
      <ol className="mt-4 space-y-2">
        {layout.order.map((tab, index) => {
          const isHidden = layout.hidden.includes(tab);
          return <li key={tab} className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2">
            <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{labels[tab]}</span>
            <Button type="button" size="icon" variant="ghost" onClick={() => onMove(tab, "up")} disabled={isSaving || index === 0} aria-label={`${labels[tab]}を上へ移動`}><ArrowUp className="h-4 w-4" /></Button>
            <Button type="button" size="icon" variant="ghost" onClick={() => onMove(tab, "down")} disabled={isSaving || index === layout.order.length - 1} aria-label={`${labels[tab]}を下へ移動`}><ArrowDown className="h-4 w-4" /></Button>
            <Button type="button" size="sm" variant={isHidden ? "outline" : "secondary"} onClick={() => onToggleVisibility(tab)} disabled={isSaving} aria-pressed={!isHidden}>
              {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : isHidden ? <EyeOff className="mr-1.5 h-4 w-4" /> : <Eye className="mr-1.5 h-4 w-4" />}
              {isHidden ? "非表示" : "表示中"}
            </Button>
          </li>;
        })}
      </ol>
    </section>
  );
}
