import { getToken } from "./authService";

const API_BASE = "http://localhost:8080/api/sets";
const API_SRS  = "http://localhost:8080/api/srs";

export interface SRSCardResponse {
  flashcardId: number;
  term: string;
  definition: string;
  repetition: number;
  easeFactor: number;
  intervalDays: number;
  nextReview: string | null;
  reviewCount: number;
  correctCount: number;
}

export interface SRSSetSummary {
  setId: number;
  setTitle: string;
  totalCards: number;
  dueCards: number;
  learnedCards: number;
  newCards: number;
}

export interface SRSStatsResponse {
  setId: number;
  setTitle: string;
  totalCards: number;
  dueCards: number;
  learnedCards: number;
  newCards: number;
}

/** Quality values theo SM-2 */
export const SRS_QUALITY = {
  AGAIN: 0, // Không nhớ
  HARD: 1,  // Nhớ nhưng khó
  GOOD: 3,  // Nhớ tốt
  EASY: 5,  // Rất dễ
} as const;

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getDueCards(setId: number): Promise<SRSCardResponse[]> {
  const res = await fetch(`${API_BASE}/${setId}/srs/due`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.data;
}

export async function reviewCard(
  setId: number,
  flashcardId: number,
  quality: number,
): Promise<SRSCardResponse> {
  const res = await fetch(`${API_BASE}/${setId}/srs/review`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ flashcardId, quality }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.data;
}

export async function getSRSStats(setId: number): Promise<SRSStatsResponse> {
  const res = await fetch(`${API_BASE}/${setId}/srs/stats`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.data;
}

export async function getSRSOverview(): Promise<SRSSetSummary[]> {
  const res = await fetch(`${API_SRS}/overview`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.data;
}
