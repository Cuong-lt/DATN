import { getToken } from './authService';

const API_BASE = 'http://localhost:8080/api/admin';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalSets: number;
  totalFlashcards: number;
  totalQuizzes: number;
  totalFolders: number;
  newUsersThisMonth: number;
  newSetsThisMonth: number;
  newQuizzesThisMonth: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  locked: boolean;
  createdAt: string;
  totalSets: number;
  totalFolders: number;
  totalQuizzes: number;
  totalCards: number;
}

export interface AdminUpdateUserRequest {
  email?: string;
  role?: string;
  newPassword?: string;
  locked?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export async function getDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
  const res = await fetch(`${API_BASE}/dashboard`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getAllUsers(
  search = '',
  page = 0,
  size = 10,
  sortBy = 'createdAt',
  sortDir = 'desc'
): Promise<ApiResponse<PageResponse<AdminUser>>> {
  const params = new URLSearchParams({
    search,
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });
  const res = await fetch(`${API_BASE}/users?${params}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getUserById(id: number): Promise<ApiResponse<AdminUser>> {
  const res = await fetch(`${API_BASE}/users/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function updateUser(id: number, data: AdminUpdateUserRequest): Promise<ApiResponse<AdminUser>> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}
