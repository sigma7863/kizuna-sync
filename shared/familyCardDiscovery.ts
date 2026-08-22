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
