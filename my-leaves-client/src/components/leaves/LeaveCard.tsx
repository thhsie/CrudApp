import { useState } from 'react';
import { Leave, LeaveStatus, LeaveType } from '../../types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatDate } from '../../utils/dateUtils';
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isAdmin } = useAuth();

  // OwnerId is not available, so non-admins can only delete their own PENDING leaves.
  // Admins can delete any PENDING leave.
  const isPending = leave.status === LeaveStatus.Pending;
  const canDelete = isPending && onDelete; // Allow delete button if handler exists and status is Pending

  // Check if any action is in progress to disable buttons
  const isActionInProgress = isApproving || isRejecting || isDeleting;

  const handleDeleteConfirm = () => {
    if (isActionInProgress) return;
    onDelete?.(leave.id);
    setIsDeleteDialogOpen(false); // Close dialog after confirmation
  };

  const handleApprove = () => {
    if (isActionInProgress) return;
    onApprove?.(leave.id);
  }

  const handleReject = () => {
     if (isActionInProgress) return;
    onReject?.(leave.id);
  }

  const handleOpenDeleteDialog = () => {
     if (isActionInProgress) return;
    setIsDeleteDialogOpen(true);
  }

  return (
    <> {/* Use Fragment */}
      <div className="card card-bordered bg-base-100 shadow-sm mb-4"> {/* Use card-bordered, shadow-sm */}
        <div className="card-body p-4 md:p-5"> {/* Slightly reduced padding */}
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
            <h2 className="card-title text-lg font-semibold mb-1 sm:mb-0"> {/* Adjusted title size/weight */}
              {getLeaveTypeText(leave.type)} Leave
            </h2>
            <LeaveStatusBadge status={leave.status} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-base-content/60 mb-0.5">Start Date</p> {/* Adjusted label style */}
              <p className="font-medium">{formatDate(leave.startDate)}</p>
            </div>
            <div>
               <p className="text-xs uppercase tracking-wider text-base-content/60 mb-0.5">End Date</p>
              <p className="font-medium">{formatDate(leave.endDate)}</p>
            </div>
          </div>

          {/* Actions */}
          {(isAdmin || canDelete) && ( // Only show actions div if there are actions
            <div className="card-actions justify-end items-center mt-3 pt-3 border-t border-base-200 space-x-2"> {/* Added border-top */}
              {/* Admin Actions */}
              {isAdmin && isPending && onApprove && onReject && (
                <>
                  <button
                    className={`btn btn-success btn-sm ${isApproving ? 'btn-disabled' : ''}`}
                    onClick={handleApprove}
                    disabled={isActionInProgress}
                    aria-label={`Approve leave request ${leave.id}`}
                  >
                     {isApproving ? <span className="loading loading-spinner loading-xs"></span> : 'Approve'}
                  </button>
                  <button
                    className={`btn btn-error btn-sm ${isRejecting ? 'btn-disabled' : ''}`}
                    onClick={handleReject}
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
                  className={`btn btn-ghost btn-sm text-error ${isDeleting ? 'btn-disabled' : ''}`} // Use ghost button for delete
                  onClick={handleOpenDeleteDialog}
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
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        confirmText="Delete"
        confirmButtonClass="btn-error" // Use error style for delete confirmation
      >
        <p>Are you sure you want to delete this leave request?</p>
        <p className="text-sm text-warning mt-2">This action cannot be undone.</p> {/* Use warning color */}
      </ConfirmDialog>
    </>
  );
};