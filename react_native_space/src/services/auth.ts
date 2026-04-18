import api, { setToken, removeToken } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'gestor' | 'motorista';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/auth/login', { email, password });
  const data = res?.data;
  if (data?.token) {
    await setToken(data.token);
  }
  return data;
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/signup', { name, email, password });
  const data = res?.data;
  if (data?.token) {
    await setToken(data.token);
  }
  return data;
}

export async function getMe(): Promise<{ user: User }> {
  const res = await api.get('/auth/me');
  return res?.data;
}

export async function updateProfile(name: string): Promise<{ user: User }> {
  const res = await api.patch('/auth/profile', { name });
  return res?.data;
}

export async function logout(): Promise<void> {
  await removeToken();
}
