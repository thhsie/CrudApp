// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/authService';

// KEEP storage key only if you want optimistic UI updates or offline cache
// const USER_STORAGE_KEY = 'currentUser';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = !!user?.roles?.includes('Admin');

  // Check auth state function - NOW RELIABLE
  const checkAuthState = useCallback(async (calledDuringLoad = false) => {
    if (!calledDuringLoad) {
        setLoading(true);
    }
    console.log("AuthContext: Checking auth state via /auth/me...");
    try {
      // Call the service function that hits /auth/me
      const currentUser = await authService.fetchCurrentUser();
      setUser(currentUser); // Set state directly from the response (null if 401)
      console.log("AuthContext: Auth check complete. User:", currentUser);
      // Optional: Save to localStorage if needed for other purposes, but not essential for auth state itself
      // if (currentUser) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      // else localStorage.removeItem(USER_STORAGE_KEY);

    } catch (error) {
      console.error('AuthContext: Failed to check auth state:', error);
      setUser(null);
      // localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState(true);
  }, [checkAuthState]);

  // Login function - Simplified
  const login = async (email: string, password: string) => {
    try {
      // authService.login now returns the user object fetched from /auth/me
      const loggedInUser = await authService.login({ email, password });
      setUser(loggedInUser); // Set state
       console.log("AuthContext: Login successful, user set:", loggedInUser);
      // Optional: localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      setUser(null);
      // localStorage.removeItem(USER_STORAGE_KEY);
      throw error; // Re-throw for form error handling
    }
  };

  // Logout function - No change needed here fundamentally
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      console.log("AuthContext: Logout successful via service.");
    } catch (error) {
      console.error('AuthContext: Logout failed on server:', error);
    } finally {
        setUser(null);
        // localStorage.removeItem(USER_STORAGE_KEY);
        setLoading(false);
        // Redirect handled by interceptor usually
    }
  };

  // Google Login - No change needed here
  const loginWithGoogle = () => {
    // localStorage.removeItem(USER_STORAGE_KEY); // Clear if using storage
    authService.initiateGoogleLogin();
    // checkAuthState will run automatically when the app reloads after redirect
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    loginWithGoogle,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook - no change
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};;