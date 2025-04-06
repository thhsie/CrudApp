import { createContext, useContext, ReactNode } from 'react';

import { useAuthQuery } from '../hooks/useAuthQuery';
import { LoginDto, User } from '../types/auth';
import { authService } from '../services/authService';

// Define the shape of the context value based on useAuthQuery return values
interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginDto) => void;
  logout: () => void;
  errorLogin: Error | null;
  isLoggingIn: boolean;
  // register: (data: RegisterDto) => void; // from useAuthQuery.register (if needed)
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use the custom hook to get auth state and actions
  const {
    currentUser,
    isLoadingUser,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    errorLogin,
    isLoggingIn,
    // register, // Include if register form is implemented
  } = useAuthQuery();

  // Google Login remains the same - initiates redirect
  const loginWithGoogle = () => {
    authService.initiateGoogleLogin();
  };

  // The value provided by the context now comes directly from useAuthQuery
  const value: AuthContextType = {
    user: currentUser,
    loading: isLoadingUser,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    errorLogin,
    isLoggingIn,
    // register,
    loginWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only once loading is false? Or handle loading within components */}
      {/* Tanstack Query's isLoading is often sufficient */}
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook remains the same structure, but consumers get TanStack Query-powered values
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};