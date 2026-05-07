import { getToken } from "./authService";
import { createFlashcard } from "./flashcardService";

const API_BASE = "http://localhost:8080/api/sets";

export interface FlashcardSetRequest {
  title: string;
  description?: string;
  visibility?: string;
  folderId?: number | null;
}

export interface FlashcardResponse {
  id: number;
  term: string;
  definition: string;
  createdAt: string;
}

export interface FlashcardSetResponse {
  id: number;
  title: string;
  description: string;
  visibility: string;
  createdAt: string;
  folderId: number | null;
  username: string;
  flashcardCount: number;
  flashcards: FlashcardResponse[];
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function getMySets(
  page = 0,
  size = 10,
): Promise<ApiResponse<PageResponse<FlashcardSetResponse>>> {
  const res = await fetch(`${API_BASE}?page=${page}&size=${size}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function searchPublicSets(
  keyword = "",
  page = 0,
  size = 10,
): Promise<ApiResponse<PageResponse<FlashcardSetResponse>>> {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });
  const res = await fetch(`${API_BASE}/search?${params}`, {
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function fetchPublicSets(
  keyword = "",
  page = 0,
  size = 10,
): Promise<ApiResponse<PageResponse<FlashcardSetResponse>>> {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });
  const token = getToken();
  const headers: HeadersInit = token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
  const res = await fetch(`${API_BASE}/search?${params}`, { headers });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getSetById(
  id: number,
): Promise<ApiResponse<FlashcardSetResponse>> {
  const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function createSet(
  data: FlashcardSetRequest,
): Promise<ApiResponse<FlashcardSetResponse>> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function updateSet(
  id: number,
  data: FlashcardSetRequest,
): Promise<ApiResponse<FlashcardSetResponse>> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function deleteSet(id: number): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function exportMySets(): Promise<void> {
  const token = getToken();
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = await fetch(`${API_BASE}/export`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { message: "Could not export sets" };
    }
    throw err;
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "flashcard-sets.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
export async function cloneSet(
  source: FlashcardSetResponse,
): Promise<ApiResponse<FlashcardSetResponse>> {
  const newSet = await createSet({
    title: `Copy of ${source.title}`,
    description: source.description || undefined,
    visibility: source.visibility,
    folderId: source.folderId,
  });
  await Promise.all(
    source.flashcards.map((fc) =>
      createFlashcard(newSet.data.id, { term: fc.term, definition: fc.definition }),
    ),
  );
  return newSet;
}

export async function exportSet(setId: number): Promise<void> {
  const token = getToken();
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const res = await fetch(`${API_BASE}/${setId}/export`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = { message: "Could not export set" };
    }
    throw err;
  }

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `flashcard-set-${setId}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}
