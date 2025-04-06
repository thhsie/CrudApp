import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leaveService } from '../services/leaveService';
import { Leave, LeaveRequest } from '../types/leave';
import { useAuth } from '../contexts/AuthContext';

export const useLeaves = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch leaves based on user role
  const { data: leaves = [], isLoading, error } = useQuery({
    queryKey: ['leaves'],
    queryFn: isAdmin ? leaveService.getAllLeaves : leaveService.getUserLeaves,
  });

  // Get a single leave
  const useLeaveDetail = (id: number) => {
    return useQuery({
      queryKey: ['leaves', id],
      queryFn: () => leaveService.getLeaveById(id),
      enabled: !!id,
    });
  };

  // Create a new leave request
  const createLeaveMutation = useMutation({
    mutationFn: (newLeave: LeaveRequest) => leaveService.createLeave(newLeave),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });

  // Approve a leave request (admin only)
  const approveLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });

  // Reject a leave request (admin only)
  const rejectLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.rejectLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });

  // Delete a leave request
  const deleteLeaveMutation = useMutation({
    mutationFn: (id: number) => leaveService.deleteLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
    },
  });

  return {
    leaves,
    isLoading,
    error,
    useLeaveDetail,
    createLeave: createLeaveMutation.mutate,
    isCreating: createLeaveMutation.isPending,
    approveLeave: approveLeaveMutation.mutate,
    isApproving: approveLeaveMutation.isPending,
    rejectLeave: rejectLeaveMutation.mutate,
    isRejecting: rejectLeaveMutation.isPending,
    deleteLeave: deleteLeaveMutation.mutate,
    isDeleting: deleteLeaveMutation.isPending,
  };
};
