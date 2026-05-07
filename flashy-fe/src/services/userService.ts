import { getToken } from './authService';

const API_BASE = 'http://localhost:8080/api/users';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  totalSets: number;
  totalFolders: number;
}

export interface DailyActivityPoint {
  date: string;   // "yyyy-MM-dd"
  count: number;
}

export interface QuizHistoryPoint {
  date: string;
  setTitle: string;
  score: number;
  total: number;
  accuracy: number;
}

export interface UserActivityResponse {
  totalCards: number;
  totalSets: number;
  totalQuizzes: number;
  currentStreak: number;
  longestStreak: number;
  overallAccuracy: number;
  dailyActivity: DailyActivityPoint[];
  recentQuizzes: QuizHistoryPoint[];
  srsTotal: number;
  srsDue: number;
  srsLearned: number;
  srsNew: number;
}

export interface UserStatsResponse {
  totalSets: number;
  totalFolders: number;
  totalCards: number;
  totalQuizzes: number;
  perfectQuizzes: number;
  bestQuizScore: number;
  bestQuizTotal: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  currentStreak: number;
  longestStreak: number;
  totalReviews: number;
  memberSince: string;
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

export async function getMyProfile(): Promise<ApiResponse<UserResponse>> {
  const res = await fetch(`${API_BASE}/me`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getMyStats(): Promise<ApiResponse<UserStatsResponse>> {
  const res = await fetch(`${API_BASE}/me/stats`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getMyActivity(): Promise<ApiResponse<UserActivityResponse>> {
  const res = await fetch(`${API_BASE}/me/activity`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function updateEmail(email: string): Promise<ApiResponse<UserResponse>> {
  const res = await fetch(`${API_BASE}/me/email`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_BASE}/me/password`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function deleteAccount(): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_BASE}/me`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}
