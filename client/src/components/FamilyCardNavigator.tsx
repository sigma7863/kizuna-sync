import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, ClipboardCopy, Heart, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FamilyDailyCardSummary } from "@/components/FamilyDailyCardSummary";
import {
  FAMILY_CARD_DISCOVERY_ITEMS,
  compareCardsByGroup,
  createDefaultDiscoveryFilters,
  createDiscoveryGroupSharePath,
  createDiscoveryStateSharePath,
  DISCOVERY_PURPOSE_SHORTCUTS,
  filterCardsByGroup,
  filterFavoriteCards,
  getCardHint,
  getDiscoveryGroups,
  getDiscoveryPurposeShortcuts,
  getDiscoveryReassurance,
  getDiscoveryCardMarkers,
  getDiscoveryResumeLabel,
  getDailyDiscoveryPick,
  getDiscoverySceneShortcuts,
  getDiscoveryStateSummary,
  getRelatedDiscoveryCards,
  getReassuranceActionShortcuts,
  getReassuranceUsageSummary,
  getDiscoveryOperationGuide,
  getDiscoveryRecoveryLabel,
  getLifeBalanceSummary,
  getDailyPurposeShortcuts,
  getDailyPurposeUsageSummary,
  getTodayFamilyPurposeShortcuts,
  getTodayFamilyPurposeUsageSummary,
  getSearchAssistSuggestions,
  getNewCardIds,
  getResumeCards,
  getRoleCardRecommendations,
  getSafeSearchSuggestions,
  getUnvisitedCardSuggestions,
  normalizeDiscoveryPace,
  normalizeDiscoveryDensity,
  normalizeDailySuggestionVisibility,
  normalizeSceneSuggestionVisibility,
  normalizeReassuranceSuggestionVisibility,
  normalizeDiscoveryDescriptionSize,
  normalizeDiscoveryGuideVisibility,
  normalizeDiscoveryRecoveryVisibility,
  normalizeLifeBalanceSuggestionVisibility,
  normalizeDailyPurposeSuggestionVisibility,
  normalizeTodayFamilyPurposeSuggestionVisibility,
  normalizeDiscoverySharedState,
  normalizeDiscoverySortMode,
  recordRecentCard,
  recordSearchHistory,
  searchFamilyCards,
  sortDiscoveryCards,
  toggleFavoriteCard,
  type DiscoverySortMode,
  type DiscoveryPace,
  type DiscoveryDensity,
  type DiscoveryRecoveryView,
  type FamilyDiscoveryRole,
} from "@shared/familyCardDiscovery";

const RECENT_KEY = "kizuna-sync-recent-family-cards";
const FAVORITES_KEY = "kizuna-sync-favorite-family-cards";
const SEARCH_HISTORY_KEY = "kizuna-sync-family-card-search-history";
const NAV_STATE_KEY = "kizuna-sync-card-navigator-state";
const PACE_KEY = "kizuna-sync-family-card-discovery-pace";
const DENSITY_KEY = "kizuna-sync-family-card-discovery-density";
const DAILY_SUGGESTION_KEY = "kizuna-sync-family-card-daily-suggestion";
const SCENE_SUGGESTION_KEY = "kizuna-sync-family-card-scene-suggestion";
const REASSURANCE_SUGGESTION_KEY = "kizuna-sync-family-card-reassurance-suggestion";
const GUIDE_VISIBILITY_KEY = "kizuna-sync-family-card-guide-visibility";
const DESCRIPTION_SIZE_KEY = "kizuna-sync-family-card-description-size";
const RECOVERY_VIEW_KEY = "kizuna-sync-family-card-recovery-view";
const RECOVERY_VISIBILITY_KEY = "kizuna-sync-family-card-recovery-visibility";
const LIFE_BALANCE_VISIBILITY_KEY = "kizuna-sync-family-card-life-balance-visibility";
const DAILY_PURPOSE_VISIBILITY_KEY = "kizuna-sync-family-card-daily-purpose-visibility";
const TODAY_FAMILY_PURPOSE_VISIBILITY_KEY = "kizuna-sync-family-card-today-purpose-visibility";
const roleLabels: Record<FamilyDiscoveryRole, string> = { guardian: "見守り役", child: "子ども", elderly: "シニア" };

export function FamilyCardNavigator({ onOpen, role = "guardian" }: { onOpen: (cardId: string) => void; role?: FamilyDiscoveryRole }) {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("すべて");
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortMode, setSortMode] = useState<DiscoverySortMode>("featured");
  const [pace, setPace] = useState<DiscoveryPace>(2);
  const [copiedGroup, setCopiedGroup] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [density, setDensity] = useState<DiscoveryDensity>("comfortable");
  const [savedView, setSavedView] = useState<{ group: string; sortMode: DiscoverySortMode; favoritesOnly: boolean } | null>(null);
  const [showDailySuggestion, setShowDailySuggestion] = useState(true);
  const [showSceneSuggestion, setShowSceneSuggestion] = useState(true);
  const [showReassuranceSuggestion, setShowReassuranceSuggestion] = useState(true);
  const [showOperationGuide, setShowOperationGuide] = useState(true);
  const [descriptionSize, setDescriptionSize] = useState<"standard" | "large">("standard");
  const [recoveryView, setRecoveryView] = useState<DiscoveryRecoveryView | null>(null);
  const [showRecoveryHint, setShowRecoveryHint] = useState(true);
  const [showLifeBalanceSuggestion, setShowLifeBalanceSuggestion] = useState(true);
  const [showDailyPurposeSuggestion, setShowDailyPurposeSuggestion] = useState(true);
  const [showTodayFamilyPurposeSuggestion, setShowTodayFamilyPurposeSuggestion] = useState(true);

  const saveRecoveryView = (view: DiscoveryRecoveryView) => {
    setRecoveryView(view);
    try { window.localStorage.setItem(RECOVERY_VIEW_KEY, JSON.stringify(view)); } catch { /* storage is optional */ }
  };
  const rememberCurrentView = () => saveRecoveryView({ query, group: activeGroup, sortMode, favoritesOnly });

  useEffect(() => {
    try {
      const recent = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
      const favorites = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
      const history = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) ?? "[]");
      const state = JSON.parse(window.localStorage.getItem(NAV_STATE_KEY) ?? "{}");
      const storedPace = JSON.parse(window.localStorage.getItem(PACE_KEY) ?? "2");
      const storedDensity = JSON.parse(window.localStorage.getItem(DENSITY_KEY) ?? "\"comfortable\"");
      const storedDailySuggestion = JSON.parse(window.localStorage.getItem(DAILY_SUGGESTION_KEY) ?? "true");
      const storedSceneSuggestion = JSON.parse(window.localStorage.getItem(SCENE_SUGGESTION_KEY) ?? "true");
      const storedReassuranceSuggestion = JSON.parse(window.localStorage.getItem(REASSURANCE_SUGGESTION_KEY) ?? "true");
      const storedGuideVisibility = JSON.parse(window.localStorage.getItem(GUIDE_VISIBILITY_KEY) ?? "true");
      const storedDescriptionSize = JSON.parse(window.localStorage.getItem(DESCRIPTION_SIZE_KEY) ?? "\"standard\"");
      const storedRecoveryView = JSON.parse(window.localStorage.getItem(RECOVERY_VIEW_KEY) ?? "null");
      const storedRecoveryVisibility = JSON.parse(window.localStorage.getItem(RECOVERY_VISIBILITY_KEY) ?? "true");
      const storedLifeBalanceVisibility = JSON.parse(window.localStorage.getItem(LIFE_BALANCE_VISIBILITY_KEY) ?? "true");
      const storedDailyPurposeVisibility = JSON.parse(window.localStorage.getItem(DAILY_PURPOSE_VISIBILITY_KEY) ?? "true");
      const storedTodayFamilyPurposeVisibility = JSON.parse(window.localStorage.getItem(TODAY_FAMILY_PURPOSE_VISIBILITY_KEY) ?? "true");
      const sharedParams = new URLSearchParams(window.location.search);
      const hasSharedState = ["cardQuery", "cardGroup", "cardSort", "cardFavorites"].some((key) => sharedParams.has(key));
      if (Array.isArray(recent)) setRecentIds(recent.filter((id): id is string => typeof id === "string"));
      if (Array.isArray(favorites)) setFavoriteIds(favorites.filter((id): id is string => typeof id === "string"));
      if (Array.isArray(history)) setSearchHistory(history.filter((item): item is string => typeof item === "string"));
      if (typeof state.group === "string") setActiveGroup(state.group);
      if (typeof state.expanded === "boolean") setIsExpanded(state.expanded);
      setSortMode(normalizeDiscoverySortMode(state.sortMode));
      if (typeof state.favoritesOnly === "boolean") setFavoritesOnly(state.favoritesOnly);
      if (typeof state.group === "string") setSavedView({ group: state.group, sortMode: normalizeDiscoverySortMode(state.sortMode), favoritesOnly: Boolean(state.favoritesOnly) });
      setPace(normalizeDiscoveryPace(storedPace));
      setDensity(normalizeDiscoveryDensity(storedDensity));
      setShowDailySuggestion(normalizeDailySuggestionVisibility(storedDailySuggestion));
      setShowSceneSuggestion(normalizeSceneSuggestionVisibility(storedSceneSuggestion));
      setShowReassuranceSuggestion(normalizeReassuranceSuggestionVisibility(storedReassuranceSuggestion));
      setShowOperationGuide(normalizeDiscoveryGuideVisibility(storedGuideVisibility));
      setDescriptionSize(normalizeDiscoveryDescriptionSize(storedDescriptionSize));
      if (storedRecoveryView && typeof storedRecoveryView.query === "string" && typeof storedRecoveryView.group === "string") setRecoveryView({ query: storedRecoveryView.query, group: storedRecoveryView.group, sortMode: normalizeDiscoverySortMode(storedRecoveryView.sortMode), favoritesOnly: storedRecoveryView.favoritesOnly === true });
      setShowRecoveryHint(normalizeDiscoveryRecoveryVisibility(storedRecoveryVisibility));
      setShowLifeBalanceSuggestion(normalizeLifeBalanceSuggestionVisibility(storedLifeBalanceVisibility));
      setShowDailyPurposeSuggestion(normalizeDailyPurposeSuggestionVisibility(storedDailyPurposeVisibility));
      setShowTodayFamilyPurposeSuggestion(normalizeTodayFamilyPurposeSuggestionVisibility(storedTodayFamilyPurposeVisibility));
      const sharedState = normalizeDiscoverySharedState({ query: sharedParams.get("cardQuery"), group: sharedParams.get("cardGroup"), sortMode: sharedParams.get("cardSort"), favoritesOnly: sharedParams.get("cardFavorites") === "1" });
      if (hasSharedState) {
        setQuery(sharedState.query);
        setActiveGroup(getDiscoveryGroups().includes(sharedState.group) ? sharedState.group : "すべて");
        setSortMode(sharedState.sortMode);
        setFavoritesOnly(sharedState.favoritesOnly);
        setIsExpanded(true);
      }
    } catch { /* storage and URL state are optional */ }
  }, []);

  const saveNavigatorState = (group: string, expanded: boolean, sort: DiscoverySortMode, nextFavoritesOnly = favoritesOnly) => {
    const nextView = { group, sortMode: sort, favoritesOnly: nextFavoritesOnly };
    setSavedView(nextView);
    try { window.localStorage.setItem(NAV_STATE_KEY, JSON.stringify({ ...nextView, expanded })); } catch { /* storage is optional */ }
  };
  const open = (id: string) => {
    const next = recordRecentCard(recentIds, id);
    setRecentIds(next);
    try { window.localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* storage is optional */ }
    onOpen(id);
  };
  const rememberSearch = (value: string) => {
    const next = recordSearchHistory(searchHistory, value);
    setSearchHistory(next);
    try { window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next)); } catch { /* storage is optional */ }
  };
  const selectGroup = (group: string) => {
    rememberCurrentView();
    setActiveGroup(group);
    setIsExpanded(true);
    saveNavigatorState(group, true, sortMode);
  };
  const copyGroupLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}${createDiscoveryStateSharePath({ query, group: activeGroup, sortMode, favoritesOnly })}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedGroup(true);
      window.setTimeout(() => setCopiedGroup(false), 1800);
    } catch { window.prompt("家族に共有するカテゴリのリンク", url); }
  };

  const groups = getDiscoveryGroups();
  const results = useMemo(() => sortDiscoveryCards(filterFavoriteCards(filterCardsByGroup(searchFamilyCards(query), activeGroup), favoriteIds, favoritesOnly), sortMode, recentIds), [query, activeGroup, sortMode, recentIds, favoriteIds, favoritesOnly]);
  const comparisonCards = useMemo(() => !query && activeGroup !== "すべて" ? compareCardsByGroup(FAMILY_CARD_DISCOVERY_ITEMS, activeGroup) : [], [activeGroup, query]);
  const recommendedCards = useMemo(() => getRoleCardRecommendations(role), [role]);
  const resumeCards = useMemo(() => getResumeCards(recentIds, favoriteIds), [recentIds, favoriteIds]);
  const unvisitedCards = useMemo(() => getUnvisitedCardSuggestions(recentIds, undefined, pace), [recentIds, pace]);
  const reassurance = useMemo(() => getDiscoveryReassurance(FAMILY_CARD_DISCOVERY_ITEMS, recentIds), [recentIds]);
  const safeSearchSuggestions = useMemo(() => query.trim() && results.length === 0 ? getSafeSearchSuggestions(query) : [], [query, results.length]);
  const searchAssistSuggestions = useMemo(() => getSearchAssistSuggestions(query), [query]);
  const purposeShortcuts = useMemo(() => getDiscoveryPurposeShortcuts(), []);
  const dailyPick = useMemo(() => getDailyDiscoveryPick(recentIds, favoriteIds), [recentIds, favoriteIds]);
  const sceneShortcuts = useMemo(() => getDiscoverySceneShortcuts(), []);
  const relatedCards = useMemo(() => getRelatedDiscoveryCards(recentIds[0]), [recentIds]);
  const reassuranceActions = useMemo(() => getReassuranceActionShortcuts(), []);
  const reassuranceUsage = useMemo(() => getReassuranceUsageSummary(recentIds), [recentIds]);
  const operationGuide = useMemo(() => getDiscoveryOperationGuide(), []);
  const lifeBalance = useMemo(() => getLifeBalanceSummary(recentIds), [recentIds]);
  const dailyPurposeShortcuts = useMemo(() => getDailyPurposeShortcuts(), []);
  const dailyPurposeUsage = useMemo(() => getDailyPurposeUsageSummary(recentIds), [recentIds]);
  const todayFamilyPurposeUsage = useMemo(() => getTodayFamilyPurposeUsageSummary(recentIds), [recentIds]);
  const discoveryStateSummary = useMemo(() => getDiscoveryStateSummary(FAMILY_CARD_DISCOVERY_ITEMS.length, results.length, { query, group: activeGroup, favoritesOnly }), [results.length, query, activeGroup, favoritesOnly]);
  const newCardIds = getNewCardIds();
  const showExplorer = isExpanded || Boolean(query) || activeGroup !== "すべて";

  return <Card id="family-card-navigator" className="mb-6 scroll-mt-4 border-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white shadow-lg">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base"><Search className="h-5 w-5 text-violet-200"/>家族ハブを見つける</CardTitle>
      <p className="text-xs text-indigo-100">言葉・目的・お気に入りから、必要なカードへすぐ移動できます。</p>
    </CardHeader>
    <CardContent className="space-y-4">
      <FamilyDailyCardSummary onOpen={open}/>
      {showOperationGuide && <section aria-label="家族ハブの使い方" className="rounded-xl border border-sky-200/20 bg-sky-100/10 p-3"><p className="text-xs font-semibold text-sky-50">使い方</p><ol className="mt-2 space-y-1 text-[11px] leading-relaxed text-sky-100">{operationGuide.map((step, index) => <li key={step}>{index + 1}. {step}</li>)}</ol></section>}
      {showDailySuggestion && dailyPick && <section aria-label="今日の一枚" className="rounded-xl border border-amber-200/20 bg-amber-100/10 p-3"><p className="text-xs font-semibold text-amber-50">今日の一枚</p><p className="mt-1 text-[11px] text-amber-100">気になったときに、ここから小さく始められます。</p><button type="button" onClick={() => open(dailyPick.id)} className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium transition hover:bg-white/25">{dailyPick.title}<ArrowRight className="h-3 w-3"/></button></section>}
      <section aria-label="あなた向けのカード" className="rounded-xl border border-white/15 bg-white/5 p-3">
        <p className="text-xs font-semibold text-violet-100">{roleLabels[role]}向けの入口</p>
        <div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1">
          {recommendedCards.map((card) => <button key={card.id} type="button" onClick={() => open(card.id)} className="min-w-36 snap-start rounded-lg bg-white/10 p-2 text-left transition hover:bg-white/20"><span className="block text-xs font-semibold">{card.title}</span><span className="mt-1 block text-[11px] text-indigo-100">{card.description}</span></button>)}
        </div>
      </section>
      <section aria-label="目的から探す" className="rounded-xl border border-white/15 bg-white/5 p-3">
        <p className="text-xs font-semibold text-violet-100">目的から探す</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {purposeShortcuts.map((shortcut) => <button key={shortcut.group} type="button" onClick={() => selectGroup(shortcut.group)} className={`rounded-full px-3 py-1.5 text-xs transition ${activeGroup === shortcut.group ? "bg-violet-300 text-slate-900" : "bg-white/10 hover:bg-white/20"}`}>{shortcut.label}</button>)}
        </div>
      </section>
      {showSceneSuggestion && <section aria-label="生活シーンから探す" className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-xs font-semibold text-violet-100">生活シーンから探す</p><div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1">{sceneShortcuts.map((scene) => <button key={scene.label} type="button" onClick={() => selectGroup(scene.group)} className="min-w-32 snap-start rounded-lg bg-white/10 p-2 text-left transition hover:bg-white/20"><span className="block text-xs font-semibold">{scene.label}</span><span className="mt-1 block text-[11px] text-indigo-100">{scene.description}</span></button>)}</div></section>}
      {showReassuranceSuggestion && <section aria-label="安心につながる一歩" className="rounded-xl border border-rose-200/20 bg-rose-100/10 p-3"><p className="text-xs font-semibold text-rose-50">安心につながる一歩</p><p className="mt-1 text-[11px] text-rose-100">{reassuranceUsage.message}</p><div className="mt-2 flex flex-wrap gap-2">{reassuranceActions.map((action) => <button key={action.group} type="button" onClick={() => selectGroup(action.group)} className="rounded-full bg-white/15 px-3 py-1.5 text-xs transition hover:bg-white/25">{action.label}</button>)}</div></section>}
      {showLifeBalanceSuggestion && <section aria-label="暮らしのバランス" className="rounded-xl border border-teal-200/20 bg-teal-100/10 p-3"><p className="text-xs font-semibold text-teal-50">暮らしのバランス</p><p className="mt-1 text-[11px] text-teal-100">{lifeBalance.message}</p><div className="mt-2 flex flex-wrap gap-2">{lifeBalance.entries.map((entry) => <button key={entry.group} type="button" onClick={() => selectGroup(entry.group)} className={`rounded-full px-3 py-1.5 text-xs transition ${entry.group === lifeBalance.nextGroup ? "bg-teal-200 text-teal-950" : "bg-white/15 hover:bg-white/25"}`}>{entry.group} {entry.count}件</button>)}</div></section>}
      {showDailyPurposeSuggestion && <section aria-label="今日の目的から探す" className="rounded-xl border border-fuchsia-200/20 bg-fuchsia-100/10 p-3"><p className="text-xs font-semibold text-fuchsia-50">今日の目的から探す</p><p className="mt-1 text-[11px] text-fuchsia-100">{dailyPurposeUsage.message}</p><div className="mt-2 flex flex-wrap gap-2">{dailyPurposeUsage.entries.map((entry) => <button key={entry.group} type="button" onClick={() => selectGroup(entry.group)} className="rounded-full bg-white/15 px-3 py-1.5 text-xs transition hover:bg-white/25">{entry.label} {entry.count}件</button>)}</div></section>}
      {showTodayFamilyPurposeSuggestion && <section aria-label="今日の家族へ" className="rounded-xl border border-amber-200/20 bg-amber-100/10 p-3"><p className="text-xs font-semibold text-amber-50">今日の家族へ</p><p className="mt-1 text-[11px] text-amber-100">{todayFamilyPurposeUsage.message}</p><div className="mt-2 flex flex-wrap gap-2">{todayFamilyPurposeUsage.entries.map((entry) => <button key={entry.group} type="button" onClick={() => selectGroup(entry.group)} className="rounded-full bg-white/15 px-3 py-1.5 text-xs transition hover:bg-white/25">{entry.label} {entry.count}件</button>)}</div></section>}
      {resumeCards.length > 0 && <section aria-label="前回のつづき" className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-xs font-semibold text-violet-100">前回のつづき</p><div className="mt-2 flex flex-wrap gap-2">{resumeCards.map((card) => <button key={card.id} type="button" onClick={() => open(card.id)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs transition hover:bg-white/20">{card.title}</button>)}</div></section>}
      {relatedCards.length > 0 && <section aria-label="続けて見てみる" className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-xs font-semibold text-violet-100">続けて見てみる</p><div className="mt-2 flex flex-wrap gap-2">{relatedCards.map((card) => <button key={card.id} type="button" onClick={() => open(card.id)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs transition hover:bg-white/20">{card.title}</button>)}</div></section>}
      {savedView && <section aria-label="前回の絞り込み" className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-xs font-semibold text-violet-100">前回の絞り込み</p><button type="button" onClick={() => { setActiveGroup(savedView.group); setSortMode(savedView.sortMode); setFavoritesOnly(savedView.favoritesOnly); setIsExpanded(true); }} className="mt-2 rounded-full bg-white/10 px-3 py-1.5 text-xs transition hover:bg-white/20">{getDiscoveryResumeLabel(savedView.group, savedView.sortMode, savedView.favoritesOnly)} で再開</button></section>}
      {unvisitedCards.length > 0 && <section aria-label="まだ見ていないカード" className="rounded-xl border border-emerald-200/20 bg-emerald-100/10 p-3"><p className="text-xs font-semibold text-emerald-50">まだ見ていないカード</p><p className="mt-1 text-[11px] leading-relaxed text-emerald-100">{reassurance}</p><div className="mt-2 flex flex-wrap gap-2">{unvisitedCards.map((card) => <button key={card.id} type="button" onClick={() => open(card.id)} className="rounded-full bg-white/15 px-3 py-1.5 text-xs transition hover:bg-white/25">{card.title}</button>)}</div><div className="mt-3 flex flex-wrap items-center gap-1.5"><span className="mr-1 text-[11px] text-emerald-100">一度に表示</span>{([1, 2, 3] as const).map((count) => <button key={count} type="button" onClick={() => { setPace(count); try { window.localStorage.setItem(PACE_KEY, JSON.stringify(count)); } catch { /* storage is optional */ } }} className={`rounded-full px-2 py-1 text-[11px] transition ${pace === count ? "bg-emerald-200 text-emerald-950" : "bg-white/10 text-white hover:bg-white/20"}`}>{count}件</button>)}</div></section>}
      <div className="flex gap-2">
        <Input value={query} onChange={(event) => { if (event.target.value !== query) rememberCurrentView(); setQuery(event.target.value); }} onKeyDown={(event) => { if (event.key === "Enter") rememberSearch(query); }} className="border-white/20 bg-white/10 text-white placeholder:text-indigo-200" placeholder="例：予定、持ち物、ありがとう" aria-label="家族カードを検索"/>
        <button type="button" onClick={() => { const next = !isExpanded; setIsExpanded(next); saveNavigatorState(activeGroup, next, sortMode); }} className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-medium transition hover:bg-white/20" aria-expanded={isExpanded}>{isExpanded ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</button>
      </div>
      {searchAssistSuggestions.length > 0 && <div className="flex flex-wrap items-center gap-2" aria-label="検索を補助する候補"><span className="text-[11px] text-indigo-100">近い候補</span>{searchAssistSuggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => { setQuery(suggestion); rememberSearch(suggestion); }} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] transition hover:bg-white/20">{suggestion}</button>)}</div>}
      {searchHistory.length > 0 && <div className="flex flex-wrap items-center gap-2" aria-label="検索履歴"><span className="text-[11px] text-indigo-100">もう一度探す</span>{searchHistory.map((item) => <button key={item} type="button" onClick={() => { setQuery(item); rememberSearch(item); }} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] transition hover:bg-white/20">{item}</button>)}<button type="button" onClick={() => { setSearchHistory([]); try { window.localStorage.removeItem(SEARCH_HISTORY_KEY); } catch { /* storage is optional */ } }} className="ml-auto text-[11px] text-indigo-100 underline-offset-2 hover:underline">履歴を消す</button></div>}
      {showRecoveryHint && recoveryView && <section aria-label="直前の探し方に戻る" className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-xs font-semibold text-violet-100">直前の探し方に戻る</p><button type="button" onClick={() => { setQuery(recoveryView.query); setActiveGroup(recoveryView.group); setSortMode(recoveryView.sortMode); setFavoritesOnly(recoveryView.favoritesOnly); setIsExpanded(true); }} className="mt-2 rounded-full bg-white/10 px-3 py-1.5 text-xs transition hover:bg-white/20">{getDiscoveryRecoveryLabel(recoveryView)} に戻る</button></section>}
      {showExplorer && <div className="space-y-3 border-t border-white/15 pt-4">
        <p aria-live="polite" className="text-[11px] text-indigo-100">{discoveryStateSummary}</p>
        <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-indigo-100">並び替え</span>{(["featured", "recent", "title"] as const).map((mode) => <button key={mode} type="button" onClick={() => { rememberCurrentView(); setSortMode(mode); saveNavigatorState(activeGroup, isExpanded, mode); }} className={`rounded-full px-2 py-1 text-[11px] ${sortMode === mode ? "bg-violet-300 text-slate-900" : "bg-white/10"}`}>{mode === "featured" ? "注目順" : mode === "recent" ? "最近順" : "名前順"}</button>)}<button type="button" onClick={() => { rememberCurrentView(); setFavoritesOnly((value) => { const next = !value; saveNavigatorState(activeGroup, isExpanded, sortMode, next); return next; }); }} className={`rounded-full px-2 py-1 text-[11px] ${favoritesOnly ? "bg-rose-300 text-slate-900" : "bg-white/10"}`}>お気に入りだけ</button><span className="ml-1 text-[11px] text-indigo-100">表示</span>{(["comfortable", "compact"] as const).map((mode) => <button key={mode} type="button" onClick={() => { setDensity(mode); try { window.localStorage.setItem(DENSITY_KEY, JSON.stringify(mode)); } catch { /* storage is optional */ } }} className={`rounded-full px-2 py-1 text-[11px] ${density === mode ? "bg-sky-200 text-slate-900" : "bg-white/10"}`}>{mode === "comfortable" ? "ゆったり" : "コンパクト"}</button>)}<button type="button" onClick={() => { const next = descriptionSize === "large" ? "standard" : "large"; setDescriptionSize(next); try { window.localStorage.setItem(DESCRIPTION_SIZE_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">説明 {descriptionSize === "large" ? "大きめ" : "標準"}</button><button type="button" onClick={() => { const next = !showTodayFamilyPurposeSuggestion; setShowTodayFamilyPurposeSuggestion(next); try { window.localStorage.setItem(TODAY_FAMILY_PURPOSE_VISIBILITY_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">今日の家族 {showTodayFamilyPurposeSuggestion ? "表示中" : "非表示"}</button><button type="button" onClick={() => { const next = !showDailyPurposeSuggestion; setShowDailyPurposeSuggestion(next); try { window.localStorage.setItem(DAILY_PURPOSE_VISIBILITY_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">今日の目的 {showDailyPurposeSuggestion ? "表示中" : "非表示"}</button><button type="button" onClick={() => { const next = !showLifeBalanceSuggestion; setShowLifeBalanceSuggestion(next); try { window.localStorage.setItem(LIFE_BALANCE_VISIBILITY_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">暮らし提案 {showLifeBalanceSuggestion ? "表示中" : "非表示"}</button><button type="button" onClick={() => { const next = !showRecoveryHint; setShowRecoveryHint(next); try { window.localStorage.setItem(RECOVERY_VISIBILITY_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">復帰案内 {showRecoveryHint ? "表示中" : "非表示"}</button><button type="button" onClick={() => { const next = !showOperationGuide; setShowOperationGuide(next); try { window.localStorage.setItem(GUIDE_VISIBILITY_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">使い方 {showOperationGuide ? "表示中" : "非表示"}</button><button type="button" onClick={() => { const next = !showDailySuggestion; setShowDailySuggestion(next); try { window.localStorage.setItem(DAILY_SUGGESTION_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">今日の一枚 {showDailySuggestion ? "表示中" : "非表示"}</button><button type="button" onClick={() => { const next = !showSceneSuggestion; setShowSceneSuggestion(next); try { window.localStorage.setItem(SCENE_SUGGESTION_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">シーン提案 {showSceneSuggestion ? "表示中" : "非表示"}</button><button type="button" onClick={() => { const next = !showReassuranceSuggestion; setShowReassuranceSuggestion(next); try { window.localStorage.setItem(REASSURANCE_SUGGESTION_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">安心提案 {showReassuranceSuggestion ? "表示中" : "非表示"}</button><button type="button" onClick={() => { setDensity("comfortable"); setPace(2); setSavedView(null); setDescriptionSize("standard"); try { window.localStorage.removeItem(NAV_STATE_KEY); window.localStorage.removeItem(PACE_KEY); window.localStorage.removeItem(DENSITY_KEY); window.localStorage.removeItem(DESCRIPTION_SIZE_KEY); } catch { /* storage is optional */ } }} className="text-[11px] text-indigo-100 underline-offset-2 hover:underline">表示設定を初期化</button>{(query || activeGroup !== "すべて" || sortMode !== "featured" || favoritesOnly) && <button type="button" onClick={() => { const defaults = createDefaultDiscoveryFilters(); setQuery(defaults.query); setActiveGroup(defaults.group); setSortMode(defaults.sortMode); setFavoritesOnly(defaults.favoritesOnly); saveNavigatorState(defaults.group, isExpanded, defaults.sortMode, defaults.favoritesOnly); }} className="ml-auto text-[11px] text-indigo-100 underline-offset-2 hover:underline">絞り込みを戻す</button>}</div>
        <div className="flex flex-wrap items-center gap-2">{groups.map((group) => <button key={group} type="button" onClick={() => selectGroup(group)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeGroup === group ? "bg-violet-300 text-slate-900" : "bg-white/10 text-indigo-100 hover:bg-white/20"}`}>{group}</button>)}<button type="button" onClick={copyGroupLink} className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs transition hover:bg-white/20"><ClipboardCopy className="h-3.5 w-3.5"/>{copiedGroup ? "コピー済み" : "この状態を共有"}</button></div>
        {comparisonCards.length > 1 && <section aria-label={`${activeGroup}のカード比較`} className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-xs font-semibold text-violet-100">似た目的から選ぶ</p><div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1">{comparisonCards.map((card) => <button key={card.id} type="button" onClick={() => open(card.id)} className="min-w-40 snap-start rounded-lg bg-white/10 p-2 text-left transition hover:bg-white/20"><span className="block text-xs font-semibold">{card.title}</span><span className="mt-1 block text-[11px] leading-relaxed text-indigo-100">{card.description}</span><span className="mt-2 inline-flex items-center gap-1 text-[11px] text-violet-200">開く <ArrowRight className="h-3 w-3"/></span></button>)}</div></section>}
        {safeSearchSuggestions.length > 0 && <section aria-live="polite" className="rounded-xl border border-amber-200/20 bg-amber-100/10 p-3"><p className="text-xs font-semibold text-amber-50">見つからないときは、こちらから</p><div className="mt-2 flex flex-wrap gap-2">{safeSearchSuggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => { const target = FAMILY_CARD_DISCOVERY_ITEMS.find((card) => card.title === suggestion); if (target) open(target.id); else { setQuery(suggestion); rememberSearch(suggestion); } }} className="rounded-full bg-white/15 px-3 py-1.5 text-xs text-white transition hover:bg-white/25">{suggestion}</button>)}</div></section>}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{results.map((card) => { const markers = getDiscoveryCardMarkers(card.id, recentIds, favoriteIds, newCardIds); return <div key={card.id} title={getCardHint(card)} className={`group flex items-center gap-2 rounded-xl bg-white/10 transition hover:bg-white/20 ${density === "compact" ? "p-2" : "p-3"}`}><button type="button" onClick={() => open(card.id)} className="min-w-0 flex-1 text-left"><span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold"><span>{card.title}</span>{card.featured && <Badge className="bg-violet-300/25 text-[10px] text-violet-100 hover:bg-violet-300/25">注目</Badge>}{markers.isNew && <Badge className="bg-emerald-300/25 text-[10px] text-emerald-100 hover:bg-emerald-300/25">新着</Badge>}{markers.isUnvisited && <Badge className="bg-sky-300/25 text-[10px] text-sky-100 hover:bg-sky-300/25">未確認</Badge>}{markers.isRecent && <Badge className="bg-amber-300/25 text-[10px] text-amber-100 hover:bg-amber-300/25">最近</Badge>}</span>{density === "comfortable" && <span className={`mt-1 block text-indigo-100 ${descriptionSize === "large" ? "text-sm leading-relaxed" : "text-xs"}`}>{card.description}</span>}</button><button type="button" onClick={() => { const next = toggleFavoriteCard(favoriteIds, card.id); setFavoriteIds(next); try { window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className={`rounded-lg p-1.5 transition ${markers.isFavorite ? "text-rose-300" : "text-indigo-200 hover:text-rose-200"}`}><Heart className={`h-4 w-4 ${markers.isFavorite ? "fill-current" : ""}`}/></button><ArrowRight className="h-4 w-4 shrink-0 text-violet-200"/></div>; })}</div>
      </div>}
    </CardContent>
  </Card>;
}
