import api from './api';
import { LoginDto, RegisterDto, User, LeaveBalancesUpdateDto, PaginatedUserResponse } from '../types/auth';
import { AxiosError } from 'axios';

const AUTH_BASE_URL = '/auth';
const USERS_BASE_URL = '/users';
const DEFAULT_PAGE_SIZE = 10;

// Helper to attempt fetching user data after auth actions
const fetchCurrentUserAfterAction = async (): Promise<User | null> => {
    try {
        const response = await api.get<User>(`${USERS_BASE_URL}/me`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response && error.response.status === 401) {
            return null; // Not authenticated
        }
        console.error("Failed to fetch user details after auth action", error);
        return null; // Assume failure means not authenticated or error
    }
};

// Helper to extract error messages (can be shared)
export const getApiErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError && error.response?.data) {
        const data = error.response.data as any; // Use any for flexibility
        // Check common ASP.NET Core Identity error structures
        if (data.errors && typeof data.errors === 'object') {
             // Flatten validation errors
            return Object.values(data.errors).flat().join(' ');
        }
        return data.message || data.title || data.detail || data || 'An API error occurred.';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred.';
};

export const authService = {
  /** Attempts login via BFF */
  login: async (loginData: LoginDto): Promise<User | null> => {
    await api.post(`${AUTH_BASE_URL}/login`, loginData);
    return await fetchCurrentUserAfterAction();
  },

  /** Attempts registration via BFF/API */
  register: async (registerData: RegisterDto): Promise<void> => {
    await api.post(`${AUTH_BASE_URL}/register`, { // BFF forwards this to API /users/register
        email: registerData.email,
        password: registerData.password,
    });
  },

  /** Logs out via BFF */
  logout: async (): Promise<void> => {
    await api.post(`${AUTH_BASE_URL}/logout`);
  },

  /** Fetches the current user details from the BFF */
  fetchCurrentUser: async (): Promise<User | null> => {
     try {
        const response = await api.get<User>(`${USERS_BASE_URL}/me`);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError && error.response && error.response.status === 401) {
            return null; // Not authenticated
        }
        console.error("Failed to fetch current user:", error);
        throw error; // Re-throw other errors
    }
  },

  /** Checks current authentication status (used on load) */
  checkCurrentUser: async (): Promise<User | null> => {
    return await fetchCurrentUserAfterAction();
  },

  /** Initiates Google login flow */
  initiateGoogleLogin: (): void => {
    window.location.href = `${AUTH_BASE_URL}/login/Google`;
  },

  /** Fetches user roles from the BFF (Admin) */
  fetchUserRoles: async (email: string): Promise<string[]> => {
    try {
      const response = await api.get(`${USERS_BASE_URL}/roles`, { params: { email: email } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      throw error;
    }
  },

  // --- UPDATED/NEW ADMIN FUNCTIONS ---

  /** Fetches paginated users (Admin) */
  getAdminUsers: async (pageParam = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedUserResponse> => {
    console.log(`Fetching admin users: page=${pageParam}, size=${pageSize}`);
    try {
        const response = await api.get<PaginatedUserResponse>(`${USERS_BASE_URL}/all`, {
            params: { pageNumber: pageParam, pageSize }, // Pass pagination params
        });
        console.log("Fetched users page:", response.data);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch admin users:", error);
        throw error;
    }
  },

  /** Updates leave balances for a specific user (Admin) */
  updateUserLeaveBalances: async (userId: string, balances: LeaveBalancesUpdateDto): Promise<void> => {
    await api.put(`${USERS_BASE_URL}/leave-balances/${userId}`, balances);
  }
};