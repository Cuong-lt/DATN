import { getToken } from './authService';

const API_BASE = 'http://localhost:8080/api/favorites';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

function authHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function toggleFavorite(setId: number): Promise<ApiResponse<boolean>> {
  const res = await fetch(`${API_BASE}/${setId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function isFavorite(setId: number): Promise<ApiResponse<boolean>> {
  const res = await fetch(`${API_BASE}/check/${setId}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getMyFavorites(): Promise<ApiResponse<import('./folderService').FlashcardSetResponse[]>> {
  const res = await fetch(API_BASE, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}
