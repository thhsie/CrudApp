import { useMutation, useQuery, useQueryClient, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { leaveService } from '../services/leaveService';
import { LeaveRequestData, PaginatedLeaveResponse } from '../types/leave';

// Query keys factory
const leavesKeys = {
  all: ['leaves'] as const,
  // Key for user infinite query
  userAll: (pageSize: number) => [...leavesKeys.all, 'user', 'all', { pageSize }] as const,
  // Key for admin infinite query
  adminAll: (pageSize: number) => [...leavesKeys.all, 'admin', 'all', { pageSize }] as const,
  // Detail key
  detail: (id: number | undefined) => [...leavesKeys.all, 'detail', id] as const,
};

// Define page sizes (can be different)
const USER_PAGE_SIZE = 10;
const ADMIN_PAGE_SIZE = 10;

export const useLeaves = () => {
  const queryClient = useQueryClient();

  // --- Queries ---

  // Fetch USER leaves with infinite scrolling
  const useUserLeavesInfinite = (pageSize: number = USER_PAGE_SIZE) => {
     return useInfiniteQuery<
         PaginatedLeaveResponse,
         Error,
         InfiniteData<PaginatedLeaveResponse>,
         readonly (string | number | { pageSize: number })[], // QueryKey type
         number // PageParam type
     >({
         queryKey: leavesKeys.userAll(pageSize), // Use the specific user key
         queryFn: ({ pageParam = 1 }) => leaveService.getUserLeaves(pageParam, pageSize), // Call user service function
         initialPageParam: 1,
         getNextPageParam: (lastPage) => {
             const totalPages = Math.ceil(lastPage.totalCount / pageSize);
             if (lastPage.pageNumber < totalPages) {
                 return lastPage.pageNumber + 1;
             }
             return undefined;
         },
         staleTime: 1 * 60 * 1000, // Cache user list for 1 minute
     });
   };

  // Fetch ADMIN leaves with infinite scrolling
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

  // Hook to get a single leave's details
  const useLeaveDetail = (id: number | undefined) => {
    return useQuery({
      queryKey: leavesKeys.detail(id),
      queryFn: () => id ? leaveService.getLeaveById(id) : Promise.resolve(null),
      enabled: !!id,
    });
  };

  // --- Mutations ---

  // Common invalidation logic - UPDATED to invalidate user infinite query too
  const invalidateLeavesQueries = (id?: number) => {
    // Invalidate the user infinite query
     queryClient.invalidateQueries({ queryKey: ['leaves', 'user', 'all'] });
    // Invalidate the admin infinite query
    queryClient.invalidateQueries({ queryKey: ['leaves', 'admin', 'all'] });
    // Invalidate specific detail query if ID is provided
    if (id) {
      queryClient.invalidateQueries({ queryKey: leavesKeys.detail(id) });
    }
  };

  // Create Leave Mutation (Remains the same, invalidation logic handles both lists)
  const createLeaveMutation = useMutation({
    mutationFn: (newLeave: LeaveRequestData) => leaveService.createLeave(newLeave),
    onSuccess: (createdLeave) => {
      console.log('Leave created:', createdLeave);
      invalidateLeavesQueries(); // Invalidate lists
       queryClient.setQueryData(leavesKeys.detail(createdLeave.id), createdLeave);
    },
    onError: (error) => console.error("Failed to create leave:", error)
  });

  // Approve Leave Mutation (Remains the same, invalidation logic handles both lists)
  const approveLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.approveLeave(id),
    onSuccess: (_, id) => {
      console.log('Leave approved:', id);
      invalidateLeavesQueries(id); // Invalidate lists and detail
    },
    onError: (error, id) => console.error(`Failed to approve leave ${id}:`, error)
  });

  // Reject Leave Mutation (Remains the same, invalidation logic handles both lists)
  const rejectLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.rejectLeave(id),
    onSuccess: (_, id) => {
      console.log('Leave rejected:', id);
      invalidateLeavesQueries(id);
    },
    onError: (error, id) => console.error(`Failed to reject leave ${id}:`, error)
  });

  // Delete Leave Mutation (Remains the same, invalidation logic handles both lists)
  const deleteLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.deleteLeave(id),
    onSuccess: (_, id) => {
      console.log('Leave deleted:', id);
      invalidateLeavesQueries(); // Invalidate lists
      queryClient.removeQueries({ queryKey: leavesKeys.detail(id) });
    },
     onError: (error, id) => console.error(`Failed to delete leave ${id}:`, error)
  });

  // --- Return values ---
  return {
    // Hooks for Querying Data
    useUserLeavesInfinite, // Hook for user paginated leaves
    useAdminLeavesInfinite, // Hook for admin paginated leaves
    useLeaveDetail, // Hook for single leave detail

    // Mutations & Status (apply across both user/admin contexts where relevant)
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
