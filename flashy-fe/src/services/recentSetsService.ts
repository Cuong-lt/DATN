import { getUsername } from "./authService";

const MAX = 10;

function storageKey(): string {
  const user = getUsername();
  return user ? `recentSets_${user}` : "recentSets_guest";
}

export interface RecentSetRecord {
  id: number;
  title: string;
  description: string;
  visibility: string;
  createdAt: string;
  flashcardCount: number;
  username?: string;
}

export function recordRecentSet(set: RecentSetRecord): void {
  const key = storageKey();
  const current = getRecentSets();
  const updated = [set, ...current.filter((s) => s.id !== set.id)].slice(0, MAX);
  localStorage.setItem(key, JSON.stringify(updated));
}

export function getRecentSets(): RecentSetRecord[] {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? (JSON.parse(raw) as RecentSetRecord[]) : [];
  } catch {
    return [];
  }
}
