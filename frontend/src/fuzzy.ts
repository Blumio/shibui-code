import type { ListItem } from "./types";

export function fuzzyScore(query: string, candidate: string): number {
  if (query.length === 0) {
    return 1;
  }

  const normalizedQuery = query.toLowerCase();
  const normalizedCandidate = candidate.toLowerCase();

  let queryIndex = 0;
  let score = 0;
  let runLength = 0;

  for (let index = 0; index < normalizedCandidate.length; index += 1) {
    if (normalizedCandidate[index] === normalizedQuery[queryIndex]) {
      queryIndex += 1;
      runLength += 1;
      score += 2 + runLength;
      if (queryIndex === normalizedQuery.length) {
        return score;
      }
    } else {
      runLength = 0;
    }
  }

  return 0;
}

export function fuzzyFilter(items: ListItem[], query: string): ListItem[] {
  const ranked = items
    .map((item) => ({
      item,
      score: fuzzyScore(query, item.searchText),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label));

  return ranked.map((entry) => entry.item);
}
