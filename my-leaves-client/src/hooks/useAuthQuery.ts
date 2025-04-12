// src/hooks/useAuthQuery.ts
import { useMutation, useQuery, useQueryClient, UseQueryResult, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { LoginDto, RegisterDto, User, LeaveBalancesUpdateDto, PaginatedUserResponse } from '../types/auth';
// Import the filter type and the updated keys factory
import { authKeys, AdminUsersFilter } from './authKeys';

// Define a type for feedback state (used by components)
export type Feedback = { type: 'success' | 'error'; message: string } | null;

// Default page size constant for admin users list
const DEFAULT_ADMIN_USERS_PAGE_SIZE = 10;

export const useAuthQuery = () => {
  const queryClient = useQueryClient();

  // --- Query: Get Current User ---
  // This query remains the same, providing the currentUser object used below
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

  // --- Query: Get Admin Users (Infinite with Filtering) ---
  // Accepts a filter object containing optional pageSize and searchTerm
  const useAdminUsersInfinite = (filter: AdminUsersFilter = {}) => {
       // Use pageSize from filter or default; extract searchTerm
       const pageSize = filter.pageSize ?? DEFAULT_ADMIN_USERS_PAGE_SIZE;
       const searchTerm = filter.searchTerm; // Will be string | null | undefined

       return useInfiniteQuery<
           PaginatedUserResponse, // Page data type
           Error,                 // Error type
           InfiniteData<PaginatedUserResponse>, // Data type (accumulator)
           ReadonlyArray<string | number | AdminUsersFilter>, // QueryKey type (matches authKeys)
           number                 // PageParam type
       >({
           // Use the key factory with the filter object
           queryKey: authKeys.adminUsers({ pageSize, searchTerm }),
           // Pass pageParam, pageSize, and searchTerm to the service function
           queryFn: ({ pageParam = 1 }) => authService.getAdminUsers(pageParam, pageSize, searchTerm),
           initialPageParam: 1,
           getNextPageParam: (lastPage) => {
               // Calculate next page based on the *actual* pageSize used for the query
               const totalPages = Math.ceil(lastPage.totalCount / pageSize);
               return lastPage.pageNumber < totalPages ? lastPage.pageNumber + 1 : undefined;
           },
           // Enable the query only if the currentUser (fetched above) is an admin
           enabled: !!currentUser?.isAdmin,
           staleTime: 2 * 60 * 1000, // Cache admin user list for 2 minutes
           gcTime: 10 * 60 * 1000,
       });
   };

  // --- Mutation: Login ---
  // Remains the same
  const loginMutation = useMutation({
    mutationFn: (loginData: LoginDto) => authService.login(loginData),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      console.log('Login successful, user cache updated.');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      queryClient.setQueryData(authKeys.currentUser(), null);
    },
  });

  // --- Mutation: Logout ---
  // Remains the same, but adjusted invalidation for clarity
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.currentUser(), null);
      // Clear admin-specific user list using the base key pattern
      queryClient.removeQueries({ queryKey: ['auth', 'users', 'admin', 'all'] });
      // Optionally clear other related data, like leaves
      queryClient.removeQueries({ queryKey: ['leaves'] });
      console.log('Logout successful, caches cleared.');
       // Redirect (kept from previous logic)
       window.location.href = '/login?loggedOut=true';
    },
    onError: (error) => {
       console.error('Logout failed:', error);
    }
  });

  // --- Mutation: Register ---
  const registerMutation = useMutation({
    mutationFn: (registerData: RegisterDto) => authService.register(registerData),
    onSuccess: () => {
      console.log('Registration successful.');
    },
     onError: (error) => {
       console.error('Registration failed:', error);
    }
  });

  // --- Mutation: Update User Leave Balances (Admin) ---
  // Updated invalidation logic
  const updateLeaveBalancesMutation = useMutation<
      void, // Return type
      Error, // Error type
      { userId: string; balances: LeaveBalancesUpdateDto }, // Variables type
      unknown // Context type
    >({
      mutationFn: ({ userId, balances }) => authService.updateUserLeaveBalances(userId, balances),
      onSuccess: (_, variables) => {
          // Invalidate *all* admin user queries using the base key pattern.
          // This ensures that any filtered/paginated view of the admin users list
          // will be refetched to show the updated balance information.
          queryClient.invalidateQueries({ queryKey: ['auth', 'users', 'admin', 'all'] });
          console.log(`Leave balances updated for user ${variables.userId}, invalidating admin user lists.`);
          // Success feedback handled by calling component
      },
      onError: (error, variables) => {
          console.error(`Failed to update leave balances for user ${variables.userId}:`, error);
          // Error feedback handled by calling component using errorUpdatingBalances state
      },
  });

  // --- Return values ---
  return {
    // Current User Query
    currentUser,
    isLoadingUser,
    errorUser,
    isAuthenticated: !!currentUser,
    isAdmin: !!currentUser?.isAdmin, // Expose isAdmin based on fetched user
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

    // --- Admin Specific ---
    // Return the hook function itself, which components will call with filters
    useAdminUsersInfinite,

    // Update Balances Mutation
    updateLeaveBalances: updateLeaveBalancesMutation.mutate,
    updateLeaveBalancesAsync: updateLeaveBalancesMutation.mutateAsync,
    isUpdatingBalances: updateLeaveBalancesMutation.isPending,
    errorUpdatingBalances: updateLeaveBalancesMutation.error,
  };
}
