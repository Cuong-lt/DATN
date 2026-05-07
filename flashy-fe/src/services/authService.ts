const API_BASE = 'http://localhost:8080/api/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export async function register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem('token');
  if (!token) return;
  await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  localStorage.removeItem('email');
}

export function saveAuth(data: AuthResponse) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('username', data.username);
  localStorage.setItem('role', data.role);
}

export function saveEmail(email: string) {
  localStorage.setItem('email', email);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getUsername(): string {
  return localStorage.getItem('username') || '';
}

export function getEmail(): string {
  return localStorage.getItem('email') || '';
}

export function getRole(): string {
  return localStorage.getItem('role') || '';
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function isAdmin(): boolean {
  return isAuthenticated() && getRole() === 'ADMIN';
}

export async function forgotPassword(email: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_BASE}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function verifyOtp(email: string, otp: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse<null>> {
  const res = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}
