import { useState } from 'react';
import { Leave, LeaveStatus, LeaveType } from '../../types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatLeaveDate } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';

interface LeaveCardProps {
  leave: Leave;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isDeleting?: boolean;
}

// Helper function to get text
const getLeaveTypeText = (type: LeaveType): string => {
    switch (type) {
      case LeaveType.Annual: return 'Annual';
      case LeaveType.Sick: return 'Sick';
      case LeaveType.Special: return 'Special';
      case LeaveType.Unpaid: return 'Unpaid';
      default: return 'Unknown';
    }
};

export const LeaveCard = ({
  leave,
  onApprove,
  onReject,
  onDelete,
  isApproving,
  isRejecting,
  isDeleting,
}: LeaveCardProps) => {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'delete' | null;
  }>({ isOpen: false, type: null });
  const { isAdmin } = useAuth();

  // OwnerId is not available, so non-admins can only delete their own PENDING leaves.
  // Admins can delete any PENDING leave.
  const isPending = leave.status === LeaveStatus.Pending;
  const canDelete = isPending && onDelete; // Allow delete button if handler exists and status is Pending

  // Check if any action is in progress to disable buttons
  const isActionInProgress = isApproving || isRejecting || isDeleting;

  const handleConfirm = () => {
    if (isActionInProgress || !confirmState.type) return;
    if (confirmState.type === 'delete') onDelete?.(leave.id);
    if (confirmState.type === 'approve') onApprove?.(leave.id);
    if (confirmState.type === 'reject') onReject?.(leave.id);
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <> {/* Use Fragment */}
      <div className="card card-bordered bg-base-200 shadow-sm p-4 md:p-4">
        <div className="card-body p-2 md:p-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
             {/* Reduced title size */}
            <h2 className="card-title text-xs md:text-sm font-semibold mb-1 sm:mb-0">
              {getLeaveTypeText(leave.type)} Leave
            </h2>
            <LeaveStatusBadge status={leave.status} />
          </div>

           {/* Dates (Reverted to grid, smaller text) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1">
            <div>
              <p className="text-xs uppercase tracking-wider text-base-content/60 mb-0.5">Start Date</p>
              {/* Ensure consistent small text */}
              <p className="font-medium text-xs">{formatLeaveDate(leave.startDate, leave.isStartHalfDay, 'start')}</p>
            </div>
            <div>
               <p className="text-xs uppercase tracking-wider text-base-content/60 mb-0.5">End Date</p>
               {/* Ensure consistent small text */}
              <p className="font-medium text-xs">{formatLeaveDate(leave.endDate, leave.isEndHalfDay, 'end')}</p>
            </div>
          </div>

          {/* Requested By (Admin only) (Reverted, already small text) */}
          {isAdmin && leave.ownerEmail && (
            <div className="mt-1">
              <p className="text-xs uppercase tracking-wider text-base-content/60 mb-0.5">Requested By</p>
              <p className="font-medium text-xs truncate" title={leave.ownerEmail}>{leave.ownerEmail}</p> {/* Added truncate */}
            </div>
          )}

          {/* Actions */}
          {(isAdmin || canDelete) && (
            <div className="card-actions justify-end items-center mt-2 pt-2 border-t border-base-300 space-x-1">
              {/* Admin Actions */}
              {isAdmin && isPending && onApprove && onReject && (
                <>
                  <button
                    className={`btn btn-success btn-xs ${isApproving ? 'btn-disabled' : ''}`}
                    onClick={() => setConfirmState({ isOpen: true, type: 'approve' })}
                    disabled={isActionInProgress}
                    aria-label={`Approve leave request ${leave.id}`}
                  >
                     {isApproving ? <span className="loading loading-spinner loading-xs"></span> : 'Approve'}
                  </button>
                  <button
                    className={`btn btn-error btn-xs ${isRejecting ? 'btn-disabled' : ''}`}
                    onClick={() => setConfirmState({ isOpen: true, type: 'reject' })}
                    disabled={isActionInProgress}
                     aria-label={`Reject leave request ${leave.id}`}
                  >
                    {isRejecting ? <span className="loading loading-spinner loading-xs"></span> : 'Reject'}
                  </button>
                </>
              )}

              {/* Delete Action (visible to admin for pending, or owner for pending) */}
              {canDelete && (
                <button
                  className={`btn btn-ghost btn-xs text-error ${isDeleting ? 'btn-disabled' : ''}`}
                  onClick={() => setConfirmState({ isOpen: true, type: 'delete' })}
                  disabled={isActionInProgress}
                   aria-label={`Delete leave request ${leave.id}`}
                >
                  {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : 'Delete'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirm}
        title={confirmState.type === 'delete' ? 'Delete Leave Request' : confirmState.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
        confirmText={confirmState.type === 'delete' ? 'Delete' : confirmState.type === 'approve' ? 'Approve' : 'Reject'}
        confirmButtonClass={confirmState.type === 'delete' ? 'btn-error' : confirmState.type === 'approve' ? 'btn-success' : 'btn-error'}
        isLoading={isActionInProgress}
      >
        {confirmState.type === 'delete' ? 'Are you sure you want to delete this leave request?' :
         confirmState.type === 'approve' ? 'Are you sure you want to approve this leave request?' :
         'Are you sure you want to reject this leave request?'}
      </ConfirmDialog>
    </>
  );
};
