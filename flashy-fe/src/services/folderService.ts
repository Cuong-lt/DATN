import { getToken } from './authService';

const API_BASE = 'http://localhost:8080/api/folders';

export interface FolderRequest {
  name: string;
}

export interface FlashcardSetResponse {
  id: number;
  title: string;
  description: string;
  visibility: string;
  createdAt: string;
  folderId: number | null;
  flashcardCount: number;
}

export interface FolderResponse {
  id: number;
  name: string;
  createdAt: string;
  sets: FlashcardSetResponse[];
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

export async function getMyFolders(): Promise<ApiResponse<FolderResponse[]>> {
  const res = await fetch(API_BASE, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getFolderById(id: number): Promise<ApiResponse<FolderResponse>> {
  const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function createFolder(data: FolderRequest): Promise<ApiResponse<FolderResponse>> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function updateFolder(id: number, data: FolderRequest): Promise<ApiResponse<FolderResponse>> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getSetsByFolder(folderId: number): Promise<ApiResponse<FlashcardSetResponse[]>> {
  const res = await fetch(`${API_BASE}/${folderId}/sets`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function deleteFolder(id: number): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}
