/* =============================================
   4. src/hooks/useAuthQuery.ts
   ============================================= */
import { useMutation, useQuery, useQueryClient, UseQueryResult, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { LoginDto, RegisterDto, User, LeaveBalancesUpdateDto, PaginatedUserResponse } from '../types/auth';
import { authKeys } from './authKeys';
// Removed toast import

// Define a type for feedback state (used by components)
export type Feedback = { type: 'success' | 'error'; message: string } | null;

const ADMIN_USERS_PAGE_SIZE = 10;

export const useAuthQuery = () => {
  const queryClient = useQueryClient();

  // --- Query: Get Current User ---
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: errorUser,
    refetch: refetchUser,
  }: UseQueryResult<User | null, Error> = useQuery({
        queryKey: authKeys.currentUser(),
        queryFn: authService.fetchCurrentUser,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: true,
  });

  // --- Query: Get Admin Users (Infinite) ---
   const useAdminUsersInfinite = (isAdmin: boolean, pageSize: number = ADMIN_USERS_PAGE_SIZE) => {
       return useInfiniteQuery<
           PaginatedUserResponse,
           Error,
           InfiniteData<PaginatedUserResponse>,
           readonly (string | number | { pageSize: number })[], // QueryKey type
           number // PageParam type
       >({
           queryKey: authKeys.adminUsers(pageSize), // Use the specific key
           queryFn: ({ pageParam = 1 }) => authService.getAdminUsers(pageParam, pageSize), // Call service
           initialPageParam: 1,
           getNextPageParam: (lastPage) => {
               const totalPages = Math.ceil(lastPage.totalCount / pageSize);
               return lastPage.pageNumber < totalPages ? lastPage.pageNumber + 1 : undefined;
           },
           enabled: isAdmin, // Only run if user is admin
           staleTime: 2 * 60 * 1000, // Cache admin user list for 2 minutes
           gcTime: 10 * 60 * 1000,
       });
   };

  // --- Mutation: Login ---
  const loginMutation = useMutation({
    mutationFn: (loginData: LoginDto) => authService.login(loginData),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      // Component should handle success feedback
      console.log('Login successful, user cache updated.');
    },
    onError: (error) => {
      // Component should handle error feedback using errorLogin state
      console.error('Login failed:', error);
      queryClient.setQueryData(authKeys.currentUser(), null);
    },
  });

  // --- Mutation: Logout ---
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.currentUser(), null);
      // Clear admin-specific data too
      queryClient.removeQueries({ queryKey: authKeys.adminUsers(ADMIN_USERS_PAGE_SIZE) });
      queryClient.removeQueries({ queryKey: ['leaves'] }); // Clear leaves too
      // Component should handle success feedback if needed
      console.log('Logout successful, user cache cleared.');
      // Redirect (kept from previous logic)
       window.location.href = '/login?loggedOut=true';
    },
    onError: (error) => {
       // Component should handle error feedback using errorLogout state
       console.error('Logout failed:', error);
    }
  });

  // --- Mutation: Register ---
  const registerMutation = useMutation({
    mutationFn: (registerData: RegisterDto) => authService.register(registerData),
    onSuccess: () => {
      // Component should handle success feedback and navigation
      console.log('Registration successful.');
    },
     onError: (error) => {
       // Component should handle error feedback using errorRegister state
       console.error('Registration failed:', error);
    }
  });

  // --- Mutation: Update User Leave Balances (Admin) ---
  const updateLeaveBalancesMutation = useMutation<
      void, // Return type
      Error, // Error type
      { userId: string; balances: LeaveBalancesUpdateDto }, // Variables type
      unknown // Context type
    >({
      mutationFn: ({ userId, balances }) => authService.updateUserLeaveBalances(userId, balances),
      onSuccess: (_, variables) => {
          // Invalidate the users list to refetch updated data
          queryClient.invalidateQueries({ queryKey: authKeys.adminUsers(ADMIN_USERS_PAGE_SIZE) });
          console.log(`Leave balances updated for user ${variables.userId}`);
          // Success feedback handled by calling component
      },
      onError: (error, variables) => {
          console.error(`Failed to update leave balances for user ${variables.userId}:`, error);
          // Error feedback handled by calling component using errorUpdatingBalances state
      },
  });


  // --- Optional Query: Get User Roles ---
  // const useUserRoles = (email?: string) => {
  //   return useQuery({
  //       queryKey: authKeys.roles(email),
  //       queryFn: () => email ? authService.fetchUserRoles(email) : Promise.resolve([]),
  //       enabled: !!email,
  //       staleTime: 10 * 60 * 1000,
  //   });
  // };


  // --- Return values ---
  return {
    // Current User Query
    currentUser,
    isLoadingUser,
    errorUser,
    isAuthenticated: !!currentUser,
    isAdmin: !!currentUser?.isAdmin,
    refetchUser,

    // Login Mutation (expose error/loading for component feedback)
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    errorLogin: loginMutation.error,

    // Logout Mutation (expose error/loading)
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    errorLogout: logoutMutation.error,

    // Register Mutation (expose error/loading)
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    errorRegister: registerMutation.error,

    // --- Admin Specific ---
    useAdminUsersInfinite, // Hook for infinite admin users
    updateLeaveBalances: updateLeaveBalancesMutation.mutate, // Expose mutate
    updateLeaveBalancesAsync: updateLeaveBalancesMutation.mutateAsync, // Expose async version
    isUpdatingBalances: updateLeaveBalancesMutation.isPending,
    errorUpdatingBalances: updateLeaveBalancesMutation.error, // Expose error state
  };
};