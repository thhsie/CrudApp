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
}

export const LeaveCard = ({
  leave,
  onApprove,
  onReject,
  onDelete,
}: LeaveCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { isAdmin, user } = useAuth();

  const isOwnLeave = user?.id === leave.userId;
  const isPending = leave.status === LeaveStatus.Pending;
  const canDelete = isAdmin || (isOwnLeave && isPending);

  const getLeaveTypeText = (type: LeaveType) => {
    switch (type) {
      case LeaveType.Vacation:
        return 'Vacation';
      case LeaveType.Sick:
        return 'Sick';
      case LeaveType.Personal:
        return 'Personal';
      case LeaveType.Bereavement:
        return 'Bereavement';
      case LeaveType.Other:
      default:
        return 'Other';
    }
  };

  const handleDelete = () => {
    onDelete?.(leave.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="card bg-base-100 shadow-xl mb-4">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">
            {getLeaveTypeText(leave.type)} Leave
            <LeaveStatusBadge status={leave.status} />
          </h2>
          <p className="text-sm opacity-70">
            Created on {formatDate(leave.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 my-2">
          <div>
            <p className="text-sm opacity-70">Start Date</p>
            <p>{formatDate(leave.startDate)}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">End Date</p>
            <p>{formatDate(leave.endDate)}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm opacity-70">Reason</p>
          <p>{leave.reason}</p>
        </div>

        <div className="card-actions justify-end">
          {isAdmin && isPending && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => onApprove?.(leave.id)}
              >
                Approve
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => onReject?.(leave.id)}
              >
                Reject
              </button>
            </>
          )}

          {canDelete && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Leave Request"
      >
        <p>Are you sure you want to delete this leave request?</p>
        <p className="text-sm text-error mt-2">This action cannot be undone.</p>
      </ConfirmDialog>
    </div>
  );
};
