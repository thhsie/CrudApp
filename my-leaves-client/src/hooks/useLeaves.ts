import { useMutation, useQuery, useQueryClient, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { leaveService } from '../services/leaveService';
import { LeaveRequestData, PaginatedLeaveResponse } from '../types/leave';
import { authKeys } from './authKeys';

// Query keys factory for leaves
const leavesKeys = {
  all: ['leaves'] as const,
  userAll: (pageSize: number) => [...leavesKeys.all, 'user', 'all', { pageSize }] as const,
  adminAll: (pageSize: number) => [...leavesKeys.all, 'admin', 'all', { pageSize }] as const,
  detail: (id: number | undefined) => [...leavesKeys.all, 'detail', id] as const,
};

// Page sizes (ensure consistency or pass them if they vary)
const USER_PAGE_SIZE = 10;
const ADMIN_PAGE_SIZE = 10;
const ADMIN_USERS_PAGE_SIZE = 10; // Page size used for the admin users infinite query

export const useLeaves = () => {
  const queryClient = useQueryClient();

  // --- Queries ---
   const useUserLeavesInfinite = (pageSize: number = USER_PAGE_SIZE) => {
     return useInfiniteQuery<
         PaginatedLeaveResponse,
         Error,
         InfiniteData<PaginatedLeaveResponse>,
         readonly (string | number | { pageSize: number })[], // QueryKey type
         number // PageParam type
     >({
         queryKey: leavesKeys.userAll(pageSize),
         queryFn: ({ pageParam = 1 }) => leaveService.getUserLeaves(pageParam, pageSize),
         initialPageParam: 1,
         getNextPageParam: (lastPage) => {
             const totalPages = Math.ceil(lastPage.totalCount / pageSize);
             return lastPage.pageNumber < totalPages ? lastPage.pageNumber + 1 : undefined;
         },
         staleTime: 1 * 60 * 1000, // Cache user list for 1 minute
     });
   };

  const useAdminLeavesInfinite = (pageSize: number = ADMIN_PAGE_SIZE) => {
    return useInfiniteQuery<
        PaginatedLeaveResponse,
        Error,
        InfiniteData<PaginatedLeaveResponse>,
        readonly (string | number | { pageSize: number })[], // QueryKey type
        number // PageParam type

    >({
        queryKey: leavesKeys.adminAll(pageSize),
        queryFn: ({ pageParam = 1 }) => leaveService.getAdminLeaves(pageParam, pageSize),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const totalPages = Math.ceil(lastPage.totalCount / pageSize);
            return lastPage.pageNumber < totalPages ? lastPage.pageNumber + 1 : undefined;
        },
        staleTime: 1 * 60 * 1000,
    });
  };

  const useLeaveDetail = (id: number | undefined) => {
    return useQuery({
      queryKey: leavesKeys.detail(id),
      queryFn: () => id ? leaveService.getLeaveById(id) : Promise.resolve(null),
      enabled: !!id, // Only run query if id is defined
      staleTime: 5 * 60 * 1000, // Cache detail for 5 minutes
    });
  };

  // --- Mutations ---

  // Centralized function to invalidate relevant queries after leave actions
  const invalidateRelevantQueries = (leaveId?: number) => {
    console.log('Invalidating queries after leave action...'); // For debugging

    // Invalidate User Leaves List (more robust invalidation)
    queryClient.invalidateQueries({ queryKey: ['leaves', 'user', 'all'] });

    // Invalidate Admin Leaves List (more robust invalidation)
    queryClient.invalidateQueries({ queryKey: ['leaves', 'admin', 'all'] });

    // Invalidate Specific Leave Detail (if ID provided)
    if (leaveId) {
      queryClient.invalidateQueries({ queryKey: leavesKeys.detail(leaveId) });
    }

    // Invalidate Admin Users List (because balances might change on approve/reject)
    // This assumes approve/reject actions call this function.
    console.log('Invalidating admin users query due to potential balance change...');
    queryClient.invalidateQueries({ queryKey: authKeys.adminUsers(ADMIN_USERS_PAGE_SIZE) });
     // More robust invalidation:
     // queryClient.invalidateQueries({ queryKey: ['auth', 'users', 'admin', 'all'] });
  };

  // Create Leave Mutation
  const createLeaveMutation = useMutation({
    mutationFn: (newLeave: LeaveRequestData) => leaveService.createLeave(newLeave),
    onSuccess: (createdLeave) => {
      console.log('Leave created:', createdLeave);
      // Invalidate lists (user and admin) after creation
      invalidateRelevantQueries();
      // Optimistically update detail view cache
      queryClient.setQueryData(leavesKeys.detail(createdLeave.id), createdLeave);
      // Feedback (e.g., alert/toast) should be handled by the component calling the mutation
    },
    onError: (error) => {
      console.error("Failed to create leave:", error);
      // Error feedback should be handled by the component (using errorCreating state)
    }
  });

  // Approve Leave Mutation
  const approveLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.approveLeave(id),
    onSuccess: (_, id) => {
      console.log('Leave approved:', id);
      // Invalidate leaves lists, specific detail, AND admin users list
      invalidateRelevantQueries(id);
      // Feedback handled by the calling component
    },
    onError: (error, id) => {
      console.error(`Failed to approve leave ${id}:`, error);
      // Error feedback handled by the calling component (using errorApproving state)
    }
  });

  // Reject Leave Mutation
  const rejectLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.rejectLeave(id),
    onSuccess: (_, id) => {
      console.log('Leave rejected:', id);
      // Invalidate leaves lists, specific detail, AND admin users list
      invalidateRelevantQueries(id);
      // Feedback handled by the calling component
    },
    onError: (error, id) => {
      console.error(`Failed to reject leave ${id}:`, error);
      // Error feedback handled by the calling component (using errorRejecting state)
    }
  });

  // Delete Leave Mutation
  const deleteLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.deleteLeave(id),
    onSuccess: (_, id) => {
      console.log('Leave deleted:', id);
       // Invalidate only leave lists (not users, as delete doesn't change balance)
       // and remove specific detail query
       queryClient.invalidateQueries({ queryKey: ['leaves', 'user', 'all'] });
       queryClient.invalidateQueries({ queryKey: ['leaves', 'admin', 'all'] });
       queryClient.removeQueries({ queryKey: leavesKeys.detail(id) });
      // Feedback handled by the calling component
    },
     onError: (error, id) => {
      console.error(`Failed to delete leave ${id}:`, error);
      // Error feedback handled by the calling component (using errorDeleting state)
     }
  });

  // --- Return values ---
  // Expose hooks and mutation functions/states
  return {
    // Query Hooks
    useUserLeavesInfinite,
    useAdminLeavesInfinite,
    useLeaveDetail,

    // Mutations (expose functions, loading states, and error states)
    createLeave: createLeaveMutation.mutate,
    createLeaveAsync: createLeaveMutation.mutateAsync,
    isCreating: createLeaveMutation.isPending,
    errorCreating: createLeaveMutation.error,

    approveLeave: approveLeaveMutation.mutate,
    approveLeaveAsync: approveLeaveMutation.mutateAsync,
    isApproving: approveLeaveMutation.isPending,
    errorApproving: approveLeaveMutation.error,

    rejectLeave: rejectLeaveMutation.mutate,
    rejectLeaveAsync: rejectLeaveMutation.mutateAsync,
    isRejecting: rejectLeaveMutation.isPending,
    errorRejecting: rejectLeaveMutation.error,

    deleteLeave: deleteLeaveMutation.mutate,
    deleteLeaveAsync: deleteLeaveMutation.mutateAsync,
    isDeleting: deleteLeaveMutation.isPending,
    errorDeleting: deleteLeaveMutation.error,
  };
};