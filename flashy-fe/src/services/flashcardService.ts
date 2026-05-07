import { getToken } from './authService';

const API_BASE = 'http://localhost:8080/api';

export interface FlashcardRequest {
  term: string;
  definition: string;
}

export interface FlashcardResponse {
  id: number;
  term: string;
  definition: string;
  createdAt: string;
}

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

export async function createFlashcard(setId: number, data: FlashcardRequest): Promise<ApiResponse<FlashcardResponse>> {
  const res = await fetch(`${API_BASE}/sets/${setId}/flashcards`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getFlashcardsBySet(setId: number): Promise<ApiResponse<FlashcardResponse[]>> {
  const res = await fetch(`${API_BASE}/sets/${setId}/flashcards`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function updateFlashcard(id: number, data: FlashcardRequest): Promise<ApiResponse<FlashcardResponse>> {
  const res = await fetch(`${API_BASE}/flashcards/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function deleteFlashcard(id: number): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_BASE}/flashcards/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}
