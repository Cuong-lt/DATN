import { getToken } from './authService';

const API_BASE = 'http://localhost:8080/api';

export interface QuizAnswerRequest {
  flashcardId: number;
  userAnswer: string;
}

export interface QuizRequest {
  answers: QuizAnswerRequest[];
}

export interface QuizAnswerResponse {
  id: number;
  flashcardId: number;
  term: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizResponse {
  id: number;
  setId: number;
  setTitle: string;
  score: number;
  totalQuestion: number;
  createdAt: string;
  answers: QuizAnswerResponse[];
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

export async function submitQuiz(setId: number, request: QuizRequest): Promise<ApiResponse<QuizResponse>> {
  const res = await fetch(`${API_BASE}/sets/${setId}/quizzes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(request),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getMyQuizzes(): Promise<ApiResponse<QuizResponse[]>> {
  const res = await fetch(`${API_BASE}/quizzes`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getQuizzesBySet(setId: number): Promise<ApiResponse<QuizResponse[]>> {
  const res = await fetch(`${API_BASE}/sets/${setId}/quizzes`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function getQuizById(id: number): Promise<ApiResponse<QuizResponse>> {
  const res = await fetch(`${API_BASE}/quizzes/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function deleteQuiz(id: number): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/quizzes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}
