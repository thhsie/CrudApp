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

  const isPending = leave.status === LeaveStatus.Pending;
  // Allow delete if handler exists AND status is Pending
  // (Admins can delete pending, users can delete their own pending)
  const canDelete = isPending && onDelete;

  // Check if *this specific card's* action is in progress
  // Note: This assumes the boolean flags (isApproving etc.) passed down might eventually target specific IDs
  // If they are global flags (e.g., "an approval is happening somewhere"), this needs adjustment.
  // Assuming for now they relate to *any* action potentially locking the UI.
  const isActionInProgress = isApproving || isRejecting || isDeleting;

  const handleDeleteConfirm = () => {
    if (isActionInProgress) return;
    onDelete?.(leave.id);
    setIsDeleteDialogOpen(false);
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

  // Add conditional classes for loading state appearance
  const cardClasses = `card card-bordered bg-base-100 shadow-sm mb-4 transition-opacity duration-300 ${isActionInProgress ? 'opacity-70 pointer-events-none' : ''}`;

  return (
    <> {/* Use Fragment */}
      <div className={cardClasses}>
        <div className="card-body p-4 md:p-5"> {/* Consistent padding */}
          {/* Header: Type and Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
            <h2 className="card-title text-lg font-semibold mb-1 sm:mb-0">
              {getLeaveTypeText(leave.type)} Leave
              <span className="text-sm font-normal text-base-content/60 ml-2">#{leave.id}</span> {/* Show ID subtly */}
            </h2>
            <LeaveStatusBadge status={leave.status} />
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 my-2 text-sm"> {/* Reduced gap and text size */}
            <div>
              <p className="text-xs uppercase tracking-wider text-base-content/60 mb-0.5">Start Date</p>
              <p className="font-medium">{formatDate(leave.startDate)}</p>
            </div>
            <div>
               <p className="text-xs uppercase tracking-wider text-base-content/60 mb-0.5">End Date</p>
              <p className="font-medium">{formatDate(leave.endDate)}</p>
            </div>
          </div>

          {/* Actions Area (only shown if actions exist) */}
          {(isAdmin && isPending && onApprove && onReject) || canDelete ? (
            <div className="card-actions justify-end items-center mt-3 pt-3 border-t border-base-200/50 space-x-2"> {/* Lighter border */}
              {/* Admin Actions */}
              {isAdmin && isPending && onApprove && onReject && (
                <>
                  <button
                    className={`btn btn-success btn-sm ${isApproving ? 'btn-disabled loading' : ''}`} // Add loading class directly
                    onClick={handleApprove}
                    disabled={isActionInProgress}
                    aria-label={`Approve leave request ${leave.id}`}
                  >
                     {isApproving ? <span className="loading loading-spinner loading-xs"></span> : 'Approve'}
                  </button>
                  <button
                    className={`btn btn-warning btn-sm ${isRejecting ? 'btn-disabled loading' : ''}`} // Changed reject to warning visually
                    onClick={handleReject}
                    disabled={isActionInProgress}
                     aria-label={`Reject leave request ${leave.id}`}
                  >
                    {isRejecting ? <span className="loading loading-spinner loading-xs"></span> : 'Reject'}
                  </button>
                </>
              )}

              {/* Delete Action */}
              {canDelete && (
                <button
                  className={`btn btn-ghost btn-sm text-error ${isDeleting ? 'btn-disabled loading' : ''}`}
                  onClick={handleOpenDeleteDialog}
                  disabled={isActionInProgress}
                   aria-label={`Delete leave request ${leave.id}`}
                >
                  {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : 'Delete'}
                </button>
              )}
            </div>
          ) : null } {/* Render null if no actions */}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        confirmText="Delete"
        confirmButtonClass="btn-error" // Keep error style for delete
      >
        <p>Are you sure you want to delete this leave request (#{leave.id})?</p>
        <p className="text-sm text-base-content/70 mt-1">Type: {getLeaveTypeText(leave.type)}</p>
        <p className="text-sm text-base-content/70">Dates: {formatDate(leave.startDate)} to {formatDate(leave.endDate)}</p>
        <p className="text-sm text-error font-semibold mt-3">This action cannot be undone.</p> {/* Use error color */}
      </ConfirmDialog>
    </>
  );
};