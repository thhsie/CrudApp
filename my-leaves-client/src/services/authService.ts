import api from './api';
import { LoginDto, RegisterDto, User } from '../types/auth';
import { AxiosError } from 'axios';

const AUTH_BASE_URL = '/auth';

// Helper to attempt fetching user data after auth actions
// NOTE: This relies on a hypothetical /auth/me endpoint in the BFF
// If it doesn't exist, this will fail and the workaround in AuthContext is needed.
const fetchCurrentUserAfterAction = async (): Promise<User | null> => {
    try {
        // --- Ideal: Replace with actual BFF endpoint ---
        const response = await api.get<User>('/users/me');
        return response.data;

        // --- Workaround Check (less reliable) ---
        // await api.get('/leaves?limit=1'); // Ping protected route
        // // Cannot get details here, return placeholder signal
        // return { isAuthenticated: true } as unknown as User;

    } catch (error) {
        if (error instanceof AxiosError && error.response && error.response.status === 401) {
            return null; // Not authenticated
        }
        console.error("Failed to fetch user details after auth action", error);
        return null; // Assume failure means not authenticated or error
    }
}

export const authService = {
  /** Attempts login via BFF */
  login: async (loginData: LoginDto): Promise<User | null> => {
    await api.post(`${AUTH_BASE_URL}/login`, loginData);
    // After successful POST, try to fetch user data
    // This implicitly confirms login worked and gets user details if endpoint exists
    return await fetchCurrentUserAfterAction();
  },

  /** Attempts registration via BFF/API */
  register: async (registerData: RegisterDto): Promise<void> => {
    // BFF forwards to API: POST /users/register
    await api.post(`${AUTH_BASE_URL}/register`, {
        email: registerData.email,
        password: registerData.password,
    });
    // Registration doesn't automatically log in with default Identity setup
    // User needs to log in separately after registering.
  },

  /** Logs out via BFF */
  logout: async (): Promise<void> => {
    await api.post(`${AUTH_BASE_URL}/logout`);
    // BFF clears the session cookie.
  },

  /** Fetches the current user details from the BFF */
  fetchCurrentUser: async (): Promise<User | null> => {
     try {
        const response = await api.get<User>(`users/me`); // Call the new endpoint
        return response.data; // Returns the User object on success
    } catch (error) {
        if (error instanceof AxiosError && error.response && error.response.status === 401) {
            return null; // Not authenticated
        }
        console.error("Failed to fetch current user:", error);
        throw error; // Re-throw other errors
    }
  },


  /** Checks current authentication status */
  checkCurrentUser: async (): Promise<User | null> => {
     // This is the primary check used on app load etc.
    return await fetchCurrentUserAfterAction();
  },

  /** Initiates Google login flow */
  initiateGoogleLogin: (): void => {
    window.location.href = `${AUTH_BASE_URL}/login/Google`;
  },

  // Add other provider functions if needed
  // initiateGitHubLogin: (): void => { ... }

  /** Fetches user roles from the BFF */
  fetchUserRoles: async (email: string): Promise<string[]> => {
    try {
      const response = await api.get('/users/roles', { params: { email: email } });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      throw error;
    }
  },
};
