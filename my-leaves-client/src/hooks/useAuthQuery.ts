import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { LoginDto, RegisterDto, User } from '../types/auth';
import { authKeys } from './authKeys';

export const useAuthQuery = () => {
  const queryClient = useQueryClient();

  // --- Query: Get Current User ---
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: errorUser,
    refetch: refetchUser, // Keep refetch if manual refresh is needed
  }: UseQueryResult<User | null, Error> = useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authService.fetchCurrentUser,
    // Configuration:
    staleTime: 5 * 60 * 1000, // Cache user data for 5 minutes
    gcTime: 15 * 60 * 1000,  // Keep data longer in cache even if inactive
    retry: 1,               // Retry once on error (useful for network hiccups)
    refetchOnWindowFocus: true, // Keep session fresh when user returns
  });

  // --- Mutation: Login ---
  const loginMutation = useMutation({
    mutationFn: (loginData: LoginDto) => authService.login(loginData),
    onSuccess: (user) => {
      // Update the currentUser query cache immediately after successful login
      queryClient.setQueryData(authKeys.currentUser(), user);
      console.log('Login successful, user cache updated.');
      // Invalidation is also an option if you prefer a refetch:
      // queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // Ensure cache reflects logged-out state on failure
      queryClient.setQueryData(authKeys.currentUser(), null);
    },
  });

  // --- Mutation: Logout ---
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear the user data from the cache
      queryClient.setQueryData(authKeys.currentUser(), null);
      // Optional: Remove query entirely or reset other related queries if needed
      // queryClient.removeQueries({ queryKey: authKeys.currentUser() });
      console.log('Logout successful, user cache cleared.');
      // Redirect logic can be handled here or in the component calling logout
    },
    onError: (error) => {
       console.error('Logout failed:', error);
       // Still clear cache as a safety measure?
       // queryClient.setQueryData(authKeys.currentUser(), null);
    }
  });

  // --- Mutation: Register ---
  const registerMutation = useMutation({
    mutationFn: (registerData: RegisterDto) => authService.register(registerData),
    // No direct cache update needed, registration doesn't log in
    onSuccess: () => {
      console.log('Registration successful.');
      // Maybe navigate to login page with a success message?
    },
     onError: (error) => {
       console.error('Registration failed:', error);
    }
  });

  // --- Optional Query: Get User Roles ---
  // Example: Could be used in an admin section
  const useUserRoles = (email?: string) => {
    return useQuery({
        queryKey: authKeys.roles(email),
        queryFn: () => email ? authService.fetchUserRoles(email) : Promise.resolve([]),
        enabled: !!email, // Only fetch if email is provided
        staleTime: 10 * 60 * 1000, // Cache roles for 10 mins
    });
  }


  // --- Return values ---
  return {
    // Current User Query
    currentUser,
    isLoadingUser,
    errorUser,
    isAuthenticated: !!currentUser,
    isAdmin: !!currentUser?.isAdmin,
    refetchUser,

    // Login Mutation
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    errorLogin: loginMutation.error,

    // Logout Mutation
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    errorLogout: logoutMutation.error,

    // Register Mutation
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    errorRegister: registerMutation.error,

    // Example Roles Query Hook (expose if needed)
    // useUserRoles,
  };
};