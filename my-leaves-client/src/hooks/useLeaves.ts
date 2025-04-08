import { useMutation, useQuery, useQueryClient, UseQueryResult, useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { leaveService } from '../services/leaveService';
import { Leave, LeaveRequestData, PaginatedLeaveResponse } from '../types/leave';

// Query keys factory
const leavesKeys = {
  all: ['leaves'] as const,
  adminAll: (pageSize: number) => [...leavesKeys.all, 'admin', 'all', { pageSize }] as const, // Key for admin infinite query
  detail: (id: number | undefined) => [...leavesKeys.all, 'detail', id] as const,
};

const ADMIN_PAGE_SIZE = 10; // Define admin page size here

export const useLeaves = () => {
  const queryClient = useQueryClient();

  // --- Queries ---

  // Fetch all leaves (for regular user dashboard)
  const {
    data: userLeaves = [], // Renamed for clarity
    isLoading: isLoadingUserLeaves,
    error: errorUserLeaves,
    refetch: refetchUserLeaves,
  }: UseQueryResult<Leave[], Error> = useQuery({
    queryKey: leavesKeys.all,
    queryFn: leaveService.getAllLeaves,
     // Consider adding staleTime/gcTime if needed for user leaves
  });

  // Hook to get a single leave's details
  const useLeaveDetail = (id: number | undefined) => {
    return useQuery({
      queryKey: leavesKeys.detail(id),
      queryFn: () => {
        if (!id) return Promise.resolve(null);
        return leaveService.getLeaveById(id);
      },
      enabled: !!id,
    });
  };

  const useAdminLeavesInfinite = (pageSize: number = ADMIN_PAGE_SIZE) => {
    return useInfiniteQuery<
        PaginatedLeaveResponse,
        Error,
        InfiniteData<PaginatedLeaveResponse>, // Type for data structure
        ReadonlyArray<string | number | { pageSize: number }>, // Type for QueryKey
        number // Type for PageParam
    >({
        queryKey: leavesKeys.adminAll(pageSize), // Use the specific key
        queryFn: ({ pageParam = 1 }) => leaveService.getAdminLeaves(pageParam, pageSize),
        initialPageParam: 1, // Start fetching from page 1
        getNextPageParam: (lastPage) => {
            // Calculate if there's a next page
            const totalPages = Math.ceil(lastPage.totalCount / pageSize);
            if (lastPage.pageNumber < totalPages) {
                return lastPage.pageNumber + 1; // Return the next page number
            }
            return undefined; // No more pages
        },
        // Optional: staleTime, gcTime etc.
        staleTime: 1 * 60 * 1000, // Cache admin list for 1 minute
    });
  };


  // --- Mutations ---

  // Common invalidation logic - UPDATED to invalidate admin query too
  const invalidateLeavesQueries = (id?: number) => {
    // Invalidate the regular user list query
    queryClient.invalidateQueries({ queryKey: leavesKeys.all });
    // Invalidate the admin infinite query (use a broader key part to catch any page size)
    queryClient.invalidateQueries({ queryKey: ['leaves', 'admin', 'all'] });
    // Invalidate specific detail query if ID is provided
    if (id) {
      queryClient.invalidateQueries({ queryKey: leavesKeys.detail(id) });
    }
  };

  // Create Leave
  const createLeaveMutation = useMutation({
    mutationFn: (newLeave: LeaveRequestData) => leaveService.createLeave(newLeave),
    onSuccess: (createdLeave) => {
      console.log('Leave created:', createdLeave);
      invalidateLeavesQueries(); // Invalidate lists
       queryClient.setQueryData(leavesKeys.detail(createdLeave.id), createdLeave);
    },
    onError: (error) => {
        console.error("Failed to create leave:", error);
    }
  });

  // Approve Leave
  const approveLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.approveLeave(id),
    onSuccess: (_, id) => {
      console.log('Leave approved:', id);
      invalidateLeavesQueries(id); // Invalidate lists and detail
    },
    onError: (error, id) => {
        console.error(`Failed to approve leave ${id}:`, error);
    }
  });

  // Reject Leave
  const rejectLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.rejectLeave(id),
    onSuccess: (_, id) => {
      console.log('Leave rejected:', id);
      invalidateLeavesQueries(id);
    },
    onError: (error, id) => {
        console.error(`Failed to reject leave ${id}:`, error);
    }
  });

  // Delete Leave
  const deleteLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.deleteLeave(id),
    onSuccess: (_, id) => {
      console.log('Leave deleted:', id);
      invalidateLeavesQueries(); // Invalidate lists
      queryClient.removeQueries({ queryKey: leavesKeys.detail(id) }); // Remove detail from cache
    },
     onError: (error, id) => {
        console.error(`Failed to delete leave ${id}:`, error);
    }
  });

  // Return values
  return {
    // Queries
    userLeaves, // User's leaves
    isLoadingUserLeaves,
    errorUserLeaves,
    refetchUserLeaves,

    useAdminLeavesInfinite, // Hook for admin paginated leaves
    useLeaveDetail, // Hook for single leave detail

    // Mutations & Status (apply to both user/admin contexts where applicable)
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