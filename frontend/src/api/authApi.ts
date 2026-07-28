import api from './axiosConfig';
import type { LoginRequest, LoginResponse, ChangePasswordRequest } from '../types/auth.types';

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
};

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await api.post('/auth/change-password', data);
};
