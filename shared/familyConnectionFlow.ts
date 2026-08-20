export function getDailyKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
export function countUnreadAppreciation(cards: Array<{ isSeen: boolean }>) { return cards.filter((card) => !card.isSeen).length; }
