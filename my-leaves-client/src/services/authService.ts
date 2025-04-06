import api from './api.ts';
import { LoginDto, RegisterDto, AuthResponse, User } from '../types/auth.ts';

export const authService = {
  login: async (loginData: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', loginData);
    return response.data;
  },

  register: async (registerData: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', registerData);
    return response.data;
  },

  logout: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get<User>('/auth/user');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  initiateGoogleLogin: (): void => {
    window.location.href = '/auth/login-google';
  },
};