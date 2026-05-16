import { getToken } from "./authService";

const API_BASE = "http://localhost:8080/api/ai";

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export interface GeneratedFlashcard {
  term: string;
  definition: string;
}

export async function generateFlashcards(
  text: string,
  cardCount: number,
): Promise<GeneratedFlashcard[]> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ text, cardCount }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json.data;
}
