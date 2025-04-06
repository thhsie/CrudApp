// --- Updated File: ./my-leaves-client/src/hooks/useLeaves.ts ---
import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { leaveService } from '../services/leaveService';
import { Leave, LeaveRequestData } from '../types/leave';

// Query keys factory
const leavesKeys = {
  all: ['leaves'] as const,
  detail: (id: number | undefined) => [...leavesKeys.all, id] as const,
};

export const useLeaves = () => {
  const queryClient = useQueryClient();

  // --- Queries ---

  // Fetch all leaves
  const {
    data: leaves = [],
    isLoading: isLoadingLeaves,
    error: errorLeaves,
    refetch: refetchLeaves,
  }: UseQueryResult<Leave[], Error> = useQuery({
    queryKey: leavesKeys.all,
    queryFn: leaveService.getAllLeaves,
  });

  // Hook to get a single leave's details
  const useLeaveDetail = (id: number | undefined) => {
    return useQuery({
      queryKey: leavesKeys.detail(id),
      queryFn: () => {
        if (!id) return Promise.resolve(null); // Return null or throw if id is needed
        return leaveService.getLeaveById(id);
      },
      enabled: !!id, // Only run query if id is valid
    });
  };

  // --- Mutations ---

  // Common invalidation logic
  const invalidateLeavesQueries = (id?: number) => {
    queryClient.invalidateQueries({ queryKey: leavesKeys.all });
    if (id) {
      queryClient.invalidateQueries({ queryKey: leavesKeys.detail(id) });
    }
  };

  // Create Leave
  const createLeaveMutation = useMutation({
    mutationFn: (newLeave: LeaveRequestData) => leaveService.createLeave(newLeave),
    onSuccess: (createdLeave) => {
      console.log('Leave created:', createdLeave);
      invalidateLeavesQueries(); // Invalidate list
       // Optionally pre-fill detail cache
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
      invalidateLeavesQueries(id); // Invalidate list and detail
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
      invalidateLeavesQueries(); // Invalidate list
      queryClient.removeQueries({ queryKey: leavesKeys.detail(id) }); // Remove detail from cache
    },
     onError: (error, id) => {
        console.error(`Failed to delete leave ${id}:`, error);
    }
  });

  // Return values
  return {
    // Queries
    leaves,
    isLoadingLeaves,
    errorLeaves,
    refetchLeaves,
    useLeaveDetail,

    // Mutations & Status
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