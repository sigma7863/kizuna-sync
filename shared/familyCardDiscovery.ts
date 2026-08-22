export type FamilyCardDiscoveryItem = { id: string; title: string; description: string; group: string; featured?: boolean };

export const FAMILY_CARD_DISCOVERY_ITEMS: FamilyCardDiscoveryItem[] = [
  { id: "card-role-handoff", title: "小さな役割バトン", description: "家の小さな役割を引き継ぐ", group: "支え合い" },
  { id: "card-place-ideas", title: "行ってみたい場所", description: "次の休日の候補を貯める", group: "予定" },
  { id: "card-family-notices", title: "家族のお知らせ", description: "大切なお知らせを確認する", group: "予定" },
  { id: "card-priority-flow", title: "家族の優先メモ", description: "今日・今週の大切なこと", group: "注目", featured: true },
  { id: "card-plan-checkins", title: "小さな予定確認", description: "予定へ短く返事をする", group: "注目", featured: true },
  { id: "card-next-steps", title: "次の一歩カード", description: "今できる小さな支えを決める", group: "注目", featured: true },
  { id: "card-household-tips", title: "家しごとコツ共有", description: "暮らしの工夫を分け合う", group: "暮らし" },
  { id: "card-packing-checks", title: "持ち物確認", description: "出発前に必要な物を見る", group: "暮らし" },
  { id: "card-together-picks", title: "一緒に楽しむ候補", description: "観る・聴く・遊ぶ候補を貯める", group: "楽しみ" },
];

export function searchFamilyCards(query: string, cards = FAMILY_CARD_DISCOVERY_ITEMS) { const normalized = query.trim().toLocaleLowerCase("ja-JP"); return normalized ? cards.filter((card) => `${card.title} ${card.description} ${card.group}`.toLocaleLowerCase("ja-JP").includes(normalized)) : cards; }
export function orderCardsByRecent(cards: FamilyCardDiscoveryItem[], recentIds: string[]) { const positions = new Map(recentIds.map((id, index) => [id, index])); return [...cards].sort((a, b) => (positions.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (positions.get(b.id) ?? Number.MAX_SAFE_INTEGER)); }
export function recordRecentCard(recentIds: string[], cardId: string, maxItems = 4) { return [cardId, ...recentIds.filter((id) => id !== cardId)].slice(0, maxItems); }
export function getDiscoveryGroups(cards = FAMILY_CARD_DISCOVERY_ITEMS) { return ["すべて", ...Array.from(new Set(cards.map((card) => card.group)))]; }
export function filterCardsByGroup(cards: FamilyCardDiscoveryItem[], group: string) { return group === "すべて" ? cards : cards.filter((card) => card.group === group); }
export function toggleFavoriteCard(favoriteIds: string[], cardId: string) { return favoriteIds.includes(cardId) ? favoriteIds.filter((id) => id !== cardId) : [cardId, ...favoriteIds]; }
export function createDailyCardDigest(featured: FamilyCardDiscoveryItem[], favorites: FamilyCardDiscoveryItem[], recent: FamilyCardDiscoveryItem[], limit = 3) { const seen = new Set<string>(); return [...featured, ...favorites, ...recent].filter((card) => !seen.has(card.id) && Boolean(seen.add(card.id))).slice(0, limit); }
export function createCardSharePath(cardId: string) { return `#${cardId}`; }
export function getSearchSuggestions(cards = FAMILY_CARD_DISCOVERY_ITEMS, limit = 4) { return Array.from(new Set(cards.flatMap((card) => [card.group, card.title]))).slice(0, limit); }
export function getShortcutCards(shortcutIds: string[], cards = FAMILY_CARD_DISCOVERY_ITEMS, limit = 3) { return shortcutIds.map((id) => cards.find((card) => card.id === id)).filter((card): card is FamilyCardDiscoveryItem => Boolean(card)).slice(0, limit); }
export function getCardPreview(cardId: string, cards = FAMILY_CARD_DISCOVERY_ITEMS) { const card = cards.find((item) => item.id === cardId); return card ? `${card.title}：${card.description}` : ""; }
export function getCardHint(card: FamilyCardDiscoveryItem) { return `${card.group}の「${card.title}」を開いて、${card.description}。`; }
export function getNewCardIds(cards = FAMILY_CARD_DISCOVERY_ITEMS, limit = 3) { return cards.slice(-limit).map((card) => card.id); }
export function sortDiscoveryCards(cards: FamilyCardDiscoveryItem[], mode: "featured" | "recent" | "title", recentIds: string[] = []) { if (mode === "recent") return orderCardsByRecent(cards, recentIds); if (mode === "title") return [...cards].sort((a, b) => a.title.localeCompare(b.title, "ja")); return [...cards].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))); }
export function getUsageSummary(cards: FamilyCardDiscoveryItem[], recentIds: string[]) { const used = cards.filter((card) => recentIds.includes(card.id)); return { usedCount: used.length, unvisitedCount: cards.length - used.length }; }
export function recordSearchHistory(history: string[], query: string, limit = 5) { const normalized = query.trim(); return normalized ? [normalized, ...history.filter((item) => item !== normalized)].slice(0, limit) : history; }
export function groupDiscoveryCards(cards: FamilyCardDiscoveryItem[]) { return cards.reduce<Record<string, FamilyCardDiscoveryItem[]>>((groups, card) => ({ ...groups, [card.group]: [...(groups[card.group] ?? []), card] }), {}); }
export function getDiscoveryOnboardingSteps() { return ["気になる言葉を入力してカードを探す", "カテゴリで目的を絞り込む", "お気に入りや今日の整理からもう一度開く"]; }
export function compareCardsByGroup(cards: FamilyCardDiscoveryItem[], group: string) { return cards.filter((card) => card.group === group).map((card) => ({ id: card.id, title: card.title, description: card.description })); }
export function getSafeSearchSuggestions(query: string, cards = FAMILY_CARD_DISCOVERY_ITEMS, limit = 3) { return searchFamilyCards(query, cards).length > 0 ? [] : getSearchSuggestions(cards, limit); }
export type FamilyDiscoveryRole = "guardian" | "child" | "elderly";
const roleCardIds: Record<FamilyDiscoveryRole, string[]> = {
  guardian: ["card-priority-flow", "card-plan-checkins", "card-role-handoff"],
  child: ["card-together-picks", "card-place-ideas", "card-next-steps"],
  elderly: ["card-priority-flow", "card-packing-checks", "card-family-notices"],
};
export function getRoleCardRecommendations(role: FamilyDiscoveryRole, cards = FAMILY_CARD_DISCOVERY_ITEMS, limit = 3) { return getShortcutCards(roleCardIds[role], cards, limit); }
export function getResumeCards(recentIds: string[], favoriteIds: string[], cards = FAMILY_CARD_DISCOVERY_ITEMS, limit = 3) { return getShortcutCards([...recentIds, ...favoriteIds.filter((id) => !recentIds.includes(id))], cards, limit); }
export type DiscoverySortMode = "featured" | "recent" | "title";
export const DISCOVERY_PURPOSE_SHORTCUTS = [
  { label: "今日のこと", group: "注目" },
  { label: "予定を整える", group: "予定" },
  { label: "暮らしのこと", group: "暮らし" },
  { label: "一緒に楽しむ", group: "楽しみ" },
  { label: "支え合う", group: "支え合い" },
] as const;
export function getDiscoveryPurposeShortcuts(cards = FAMILY_CARD_DISCOVERY_ITEMS) { const groups = new Set(cards.map((card) => card.group)); return DISCOVERY_PURPOSE_SHORTCUTS.filter((shortcut) => groups.has(shortcut.group)); }
export function createDiscoveryGroupSharePath(group: string) { return `?cardGroup=${encodeURIComponent(group)}#family-card-navigator`; }
export function normalizeDiscoverySortMode(value: unknown): DiscoverySortMode { return value === "recent" || value === "title" ? value : "featured"; }
export type DiscoveryPace = 1 | 2 | 3;
export function normalizeDiscoveryPace(value: unknown): DiscoveryPace { return value === 1 || value === 3 ? value : 2; }
export function getUnvisitedCardSuggestions(recentIds: string[], cards = FAMILY_CARD_DISCOVERY_ITEMS, limit: DiscoveryPace = 2) { return [...cards].filter((card) => !recentIds.includes(card.id)).sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))).slice(0, limit); }
export function getDiscoveryReassurance(cards: FamilyCardDiscoveryItem[], recentIds: string[]) { const usage = getUsageSummary(cards, recentIds); if (usage.usedCount === 0) return "気になる一枚から、ゆっくり始めてみましょう。"; if (usage.unvisitedCount === 0) return "よく使う入口がそろいました。必要なときにまた開けます。"; return `あと${usage.unvisitedCount}枚。気になるものを一つだけ見てみましょう。`; }
export function filterFavoriteCards(cards: FamilyCardDiscoveryItem[], favoriteIds: string[], favoritesOnly: boolean) { return favoritesOnly ? cards.filter((card) => favoriteIds.includes(card.id)) : cards; }
export function createDefaultDiscoveryFilters() { return { query: "", group: "すべて", sortMode: "featured" as DiscoverySortMode, favoritesOnly: false }; }
export type DiscoveryDensity = "comfortable" | "compact";
export function normalizeDiscoveryDensity(value: unknown): DiscoveryDensity { return value === "compact" ? "compact" : "comfortable"; }
export function getDiscoveryCardMarkers(cardId: string, recentIds: string[], favoriteIds: string[], newCardIds: string[]) { return { isRecent: recentIds.includes(cardId), isFavorite: favoriteIds.includes(cardId), isNew: newCardIds.includes(cardId), isUnvisited: !recentIds.includes(cardId) }; }
export function getDiscoveryResumeLabel(group: string, sortMode: DiscoverySortMode, favoritesOnly: boolean) { const groupLabel = group === "すべて" ? "すべて" : group; const sortLabel = sortMode === "recent" ? "最近順" : sortMode === "title" ? "名前順" : "注目順"; return `${groupLabel}・${sortLabel}${favoritesOnly ? "・お気に入り" : ""}`; }
export function getSearchAssistSuggestions(query: string, cards = FAMILY_CARD_DISCOVERY_ITEMS, limit = 4) { const normalized = query.trim().toLocaleLowerCase("ja-JP"); if (!normalized) return []; return Array.from(new Set(cards.flatMap((card) => [card.title, card.group]).filter((term) => term.toLocaleLowerCase("ja-JP").includes(normalized)))).slice(0, limit); }
export function createDiscoveryStateSharePath(state: { query: string; group: string; sortMode: DiscoverySortMode; favoritesOnly: boolean }) { const params = new URLSearchParams(); if (state.query) params.set("cardQuery", state.query); if (state.group !== "すべて") params.set("cardGroup", state.group); if (state.sortMode !== "featured") params.set("cardSort", state.sortMode); if (state.favoritesOnly) params.set("cardFavorites", "1"); const query = params.toString(); return `${query ? `?${query}` : ""}#family-card-navigator`; }
export function normalizeDiscoverySharedState(value: { query?: unknown; group?: unknown; sortMode?: unknown; favoritesOnly?: unknown }) { return { query: typeof value.query === "string" ? value.query : "", group: typeof value.group === "string" ? value.group : "すべて", sortMode: normalizeDiscoverySortMode(value.sortMode), favoritesOnly: value.favoritesOnly === true }; }
export function getDailyDiscoveryPick(recentIds: string[], favoriteIds: string[], cards = FAMILY_CARD_DISCOVERY_ITEMS) { return cards.find((card) => favoriteIds.includes(card.id) && !recentIds.includes(card.id)) ?? getUnvisitedCardSuggestions(recentIds, cards, 1)[0] ?? cards[0]; }
export function getDiscoveryStateSummary(total: number, visible: number, state: { query: string; group: string; favoritesOnly: boolean }) { if (visible === 0) return "条件に合うカードはありません。言葉や絞り込みを変えてみましょう。"; const filters = [state.query && `「${state.query}」`, state.group !== "すべて" && state.group, state.favoritesOnly && "お気に入り"].filter(Boolean); return filters.length ? `${filters.join("・")}で ${visible}/${total} 枚を表示中` : `${visible} 枚のカードを表示中`; }
export function normalizeDailySuggestionVisibility(value: unknown) { return value !== false; }
export const DISCOVERY_SCENE_SHORTCUTS = [
  { label: "朝の準備", group: "注目", description: "今日の優先を確認" },
  { label: "出かける前", group: "暮らし", description: "持ち物や予定を確認" },
  { label: "夜のひととき", group: "楽しみ", description: "一緒に楽しむ時間を探す" },
] as const;
export function getDiscoverySceneShortcuts(cards = FAMILY_CARD_DISCOVERY_ITEMS) { const groups = new Set(cards.map((card) => card.group)); return DISCOVERY_SCENE_SHORTCUTS.filter((shortcut) => groups.has(shortcut.group)); }
export function getRelatedDiscoveryCards(cardId: string | undefined, cards = FAMILY_CARD_DISCOVERY_ITEMS, limit = 2) { const source = cards.find((card) => card.id === cardId); return source ? cards.filter((card) => card.id !== source.id && card.group === source.group).slice(0, limit) : []; }
export function normalizeSceneSuggestionVisibility(value: unknown) { return value !== false; }
export const REASSURANCE_ACTION_SHORTCUTS = [
  { label: "気づかいを届ける", group: "支え合い" },
  { label: "予定を確かめる", group: "予定" },
  { label: "小さな助けを決める", group: "注目" },
] as const;
export function getReassuranceActionShortcuts(cards = FAMILY_CARD_DISCOVERY_ITEMS) { const groups = new Set(cards.map((card) => card.group)); return REASSURANCE_ACTION_SHORTCUTS.filter((shortcut) => groups.has(shortcut.group)); }
export function getReassuranceUsageSummary(recentIds: string[], cards = FAMILY_CARD_DISCOVERY_ITEMS) { const actions = getReassuranceActionShortcuts(cards); const counts = actions.map((action) => ({ ...action, count: cards.filter((card) => card.group === action.group && recentIds.includes(card.id)).length })); const next = [...counts].sort((a, b) => a.count - b.count)[0]; return { counts, message: next ? `次は「${next.label}」から、家族の小さな一歩を選べます。` : "気になる行動から、ゆっくり始めましょう。" }; }
export function normalizeReassuranceSuggestionVisibility(value: unknown) { return value !== false; }
export function getDiscoveryOperationGuide() { return ["言葉を入力すると近いカードが候補に出ます", "目的や生活シーンを選ぶとカードを絞り込めます", "共有ボタンで今の探し方を家族へ渡せます"]; }
export type DiscoveryDescriptionSize = "standard" | "large";
export function normalizeDiscoveryDescriptionSize(value: unknown): DiscoveryDescriptionSize { return value === "large" ? "large" : "standard"; }
export function normalizeDiscoveryGuideVisibility(value: unknown) { return value !== false; }
export type DiscoveryRecoveryView = { query: string; group: string; sortMode: DiscoverySortMode; favoritesOnly: boolean };
export function getDiscoveryRecoveryLabel(view: DiscoveryRecoveryView) { const parts = [view.query && `「${view.query}」`, view.group !== "すべて" && view.group, view.favoritesOnly && "お気に入り", view.sortMode !== "featured" && (view.sortMode === "recent" ? "最近順" : "名前順")].filter(Boolean); return parts.length ? parts.join("・") : "すべてのカード"; }
export function normalizeDiscoveryRecoveryVisibility(value: unknown) { return value !== false; }
