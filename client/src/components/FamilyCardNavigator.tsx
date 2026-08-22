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
  DISCOVERY_PURPOSE_SHORTCUTS,
  filterCardsByGroup,
  filterFavoriteCards,
  getCardHint,
  getDiscoveryGroups,
  getDiscoveryPurposeShortcuts,
  getDiscoveryReassurance,
  getDiscoveryCardMarkers,
  getDiscoveryResumeLabel,
  getNewCardIds,
  getResumeCards,
  getRoleCardRecommendations,
  getSafeSearchSuggestions,
  getUnvisitedCardSuggestions,
  normalizeDiscoveryPace,
  normalizeDiscoveryDensity,
  normalizeDiscoverySortMode,
  recordRecentCard,
  recordSearchHistory,
  searchFamilyCards,
  sortDiscoveryCards,
  toggleFavoriteCard,
  type DiscoverySortMode,
  type DiscoveryPace,
  type DiscoveryDensity,
  type FamilyDiscoveryRole,
} from "@shared/familyCardDiscovery";

const RECENT_KEY = "kizuna-sync-recent-family-cards";
const FAVORITES_KEY = "kizuna-sync-favorite-family-cards";
const SEARCH_HISTORY_KEY = "kizuna-sync-family-card-search-history";
const NAV_STATE_KEY = "kizuna-sync-card-navigator-state";
const PACE_KEY = "kizuna-sync-family-card-discovery-pace";
const DENSITY_KEY = "kizuna-sync-family-card-discovery-density";
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

  useEffect(() => {
    try {
      const recent = JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]");
      const favorites = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]");
      const history = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) ?? "[]");
      const state = JSON.parse(window.localStorage.getItem(NAV_STATE_KEY) ?? "{}");
      const storedPace = JSON.parse(window.localStorage.getItem(PACE_KEY) ?? "2");
      const storedDensity = JSON.parse(window.localStorage.getItem(DENSITY_KEY) ?? "\"comfortable\"");
      const sharedGroup = new URLSearchParams(window.location.search).get("cardGroup");
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
      if (sharedGroup && getDiscoveryGroups().includes(sharedGroup)) {
        setActiveGroup(sharedGroup);
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
    setActiveGroup(group);
    setIsExpanded(true);
    saveNavigatorState(group, true, sortMode);
  };
  const copyGroupLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}${createDiscoveryGroupSharePath(activeGroup)}`;
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
  const purposeShortcuts = useMemo(() => getDiscoveryPurposeShortcuts(), []);
  const newCardIds = getNewCardIds();
  const showExplorer = isExpanded || Boolean(query) || activeGroup !== "すべて";

  return <Card id="family-card-navigator" className="mb-6 scroll-mt-4 border-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 text-white shadow-lg">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base"><Search className="h-5 w-5 text-violet-200"/>家族ハブを見つける</CardTitle>
      <p className="text-xs text-indigo-100">言葉・目的・お気に入りから、必要なカードへすぐ移動できます。</p>
    </CardHeader>
    <CardContent className="space-y-4">
      <FamilyDailyCardSummary onOpen={open}/>
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
      {resumeCards.length > 0 && <section aria-label="前回のつづき" className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-xs font-semibold text-violet-100">前回のつづき</p><div className="mt-2 flex flex-wrap gap-2">{resumeCards.map((card) => <button key={card.id} type="button" onClick={() => open(card.id)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs transition hover:bg-white/20">{card.title}</button>)}</div></section>}
      {savedView && <section aria-label="前回の絞り込み" className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-xs font-semibold text-violet-100">前回の絞り込み</p><button type="button" onClick={() => { setActiveGroup(savedView.group); setSortMode(savedView.sortMode); setFavoritesOnly(savedView.favoritesOnly); setIsExpanded(true); }} className="mt-2 rounded-full bg-white/10 px-3 py-1.5 text-xs transition hover:bg-white/20">{getDiscoveryResumeLabel(savedView.group, savedView.sortMode, savedView.favoritesOnly)} で再開</button></section>}
      {unvisitedCards.length > 0 && <section aria-label="まだ見ていないカード" className="rounded-xl border border-emerald-200/20 bg-emerald-100/10 p-3"><p className="text-xs font-semibold text-emerald-50">まだ見ていないカード</p><p className="mt-1 text-[11px] leading-relaxed text-emerald-100">{reassurance}</p><div className="mt-2 flex flex-wrap gap-2">{unvisitedCards.map((card) => <button key={card.id} type="button" onClick={() => open(card.id)} className="rounded-full bg-white/15 px-3 py-1.5 text-xs transition hover:bg-white/25">{card.title}</button>)}</div><div className="mt-3 flex flex-wrap items-center gap-1.5"><span className="mr-1 text-[11px] text-emerald-100">一度に表示</span>{([1, 2, 3] as const).map((count) => <button key={count} type="button" onClick={() => { setPace(count); try { window.localStorage.setItem(PACE_KEY, JSON.stringify(count)); } catch { /* storage is optional */ } }} className={`rounded-full px-2 py-1 text-[11px] transition ${pace === count ? "bg-emerald-200 text-emerald-950" : "bg-white/10 text-white hover:bg-white/20"}`}>{count}件</button>)}</div></section>}
      <div className="flex gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") rememberSearch(query); }} className="border-white/20 bg-white/10 text-white placeholder:text-indigo-200" placeholder="例：予定、持ち物、ありがとう" aria-label="家族カードを検索"/>
        <button type="button" onClick={() => { const next = !isExpanded; setIsExpanded(next); saveNavigatorState(activeGroup, next, sortMode); }} className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-medium transition hover:bg-white/20" aria-expanded={isExpanded}>{isExpanded ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}</button>
      </div>
      {searchHistory.length > 0 && <div className="flex flex-wrap items-center gap-2" aria-label="検索履歴"><span className="text-[11px] text-indigo-100">もう一度探す</span>{searchHistory.map((item) => <button key={item} type="button" onClick={() => { setQuery(item); rememberSearch(item); }} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] transition hover:bg-white/20">{item}</button>)}<button type="button" onClick={() => { setSearchHistory([]); try { window.localStorage.removeItem(SEARCH_HISTORY_KEY); } catch { /* storage is optional */ } }} className="ml-auto text-[11px] text-indigo-100 underline-offset-2 hover:underline">履歴を消す</button></div>}
      {showExplorer && <div className="space-y-3 border-t border-white/15 pt-4">
        <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-indigo-100">並び替え</span>{(["featured", "recent", "title"] as const).map((mode) => <button key={mode} type="button" onClick={() => { setSortMode(mode); saveNavigatorState(activeGroup, isExpanded, mode); }} className={`rounded-full px-2 py-1 text-[11px] ${sortMode === mode ? "bg-violet-300 text-slate-900" : "bg-white/10"}`}>{mode === "featured" ? "注目順" : mode === "recent" ? "最近順" : "名前順"}</button>)}<button type="button" onClick={() => setFavoritesOnly((value) => { const next = !value; saveNavigatorState(activeGroup, isExpanded, sortMode, next); return next; })} className={`rounded-full px-2 py-1 text-[11px] ${favoritesOnly ? "bg-rose-300 text-slate-900" : "bg-white/10"}`}>お気に入りだけ</button><span className="ml-1 text-[11px] text-indigo-100">表示</span>{(["comfortable", "compact"] as const).map((mode) => <button key={mode} type="button" onClick={() => { setDensity(mode); try { window.localStorage.setItem(DENSITY_KEY, JSON.stringify(mode)); } catch { /* storage is optional */ } }} className={`rounded-full px-2 py-1 text-[11px] ${density === mode ? "bg-sky-200 text-slate-900" : "bg-white/10"}`}>{mode === "comfortable" ? "ゆったり" : "コンパクト"}</button>)}{(query || activeGroup !== "すべて" || sortMode !== "featured" || favoritesOnly) && <button type="button" onClick={() => { const defaults = createDefaultDiscoveryFilters(); setQuery(defaults.query); setActiveGroup(defaults.group); setSortMode(defaults.sortMode); setFavoritesOnly(defaults.favoritesOnly); saveNavigatorState(defaults.group, isExpanded, defaults.sortMode, defaults.favoritesOnly); }} className="ml-auto text-[11px] text-indigo-100 underline-offset-2 hover:underline">絞り込みを戻す</button>}</div>
        <div className="flex flex-wrap items-center gap-2">{groups.map((group) => <button key={group} type="button" onClick={() => selectGroup(group)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${activeGroup === group ? "bg-violet-300 text-slate-900" : "bg-white/10 text-indigo-100 hover:bg-white/20"}`}>{group}</button>)}{activeGroup !== "すべて" && <button type="button" onClick={copyGroupLink} className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs transition hover:bg-white/20"><ClipboardCopy className="h-3.5 w-3.5"/>{copiedGroup ? "コピー済み" : "このカテゴリを共有"}</button>}</div>
        {comparisonCards.length > 1 && <section aria-label={`${activeGroup}のカード比較`} className="rounded-xl border border-white/15 bg-white/5 p-3"><p className="text-xs font-semibold text-violet-100">似た目的から選ぶ</p><div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1">{comparisonCards.map((card) => <button key={card.id} type="button" onClick={() => open(card.id)} className="min-w-40 snap-start rounded-lg bg-white/10 p-2 text-left transition hover:bg-white/20"><span className="block text-xs font-semibold">{card.title}</span><span className="mt-1 block text-[11px] leading-relaxed text-indigo-100">{card.description}</span><span className="mt-2 inline-flex items-center gap-1 text-[11px] text-violet-200">開く <ArrowRight className="h-3 w-3"/></span></button>)}</div></section>}
        {safeSearchSuggestions.length > 0 && <section aria-live="polite" className="rounded-xl border border-amber-200/20 bg-amber-100/10 p-3"><p className="text-xs font-semibold text-amber-50">見つからないときは、こちらから</p><div className="mt-2 flex flex-wrap gap-2">{safeSearchSuggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => { const target = FAMILY_CARD_DISCOVERY_ITEMS.find((card) => card.title === suggestion); if (target) open(target.id); else { setQuery(suggestion); rememberSearch(suggestion); } }} className="rounded-full bg-white/15 px-3 py-1.5 text-xs text-white transition hover:bg-white/25">{suggestion}</button>)}</div></section>}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{results.map((card) => { const markers = getDiscoveryCardMarkers(card.id, recentIds, favoriteIds, newCardIds); return <div key={card.id} title={getCardHint(card)} className={`group flex items-center gap-2 rounded-xl bg-white/10 transition hover:bg-white/20 ${density === "compact" ? "p-2" : "p-3"}`}><button type="button" onClick={() => open(card.id)} className="min-w-0 flex-1 text-left"><span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold"><span>{card.title}</span>{card.featured && <Badge className="bg-violet-300/25 text-[10px] text-violet-100 hover:bg-violet-300/25">注目</Badge>}{markers.isNew && <Badge className="bg-emerald-300/25 text-[10px] text-emerald-100 hover:bg-emerald-300/25">新着</Badge>}{markers.isUnvisited && <Badge className="bg-sky-300/25 text-[10px] text-sky-100 hover:bg-sky-300/25">未確認</Badge>}{markers.isRecent && <Badge className="bg-amber-300/25 text-[10px] text-amber-100 hover:bg-amber-300/25">最近</Badge>}</span>{density === "comfortable" && <span className="mt-1 block text-xs text-indigo-100">{card.description}</span>}</button><button type="button" onClick={() => { const next = toggleFavoriteCard(favoriteIds, card.id); setFavoriteIds(next); try { window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* storage is optional */ } }} className={`rounded-lg p-1.5 transition ${markers.isFavorite ? "text-rose-300" : "text-indigo-200 hover:text-rose-200"}`}><Heart className={`h-4 w-4 ${markers.isFavorite ? "fill-current" : ""}`}/></button><ArrowRight className="h-4 w-4 shrink-0 text-violet-200"/></div>; })}</div>
      </div>}
    </CardContent>
  </Card>;
}
