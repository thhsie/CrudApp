import { Leave, LeaveStatus, LeaveType } from '../../types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatLeaveDate } from '../../utils/dateUtils';

// Define props for the component
interface LeaveTableProps {
    leaves: Leave[];
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onDelete: (id: number) => void;
    isApproving: boolean;
    isRejecting: boolean;
    isDeleting: boolean;
}

export const LeaveTable = ({
    leaves,
    onApprove,
    onReject,
    onDelete,
    isApproving,
    isRejecting,
    isDeleting
}: LeaveTableProps) => {
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | 'delete' | null;
        leaveId: number | null;
    }>({ isOpen: false, type: null, leaveId: null });

    if (!leaves || leaves.length === 0) {
        return null;
    }

    return (
        <div className="overflow-x-auto">
            <table className="table table-sm table-zebra w-full">
                <thead className="bg-base-200">
                    <tr>
                        <th>User</th>
                        <th>
                            <div className="flex items-center gap-1">
                                    Start Date
                            </div>
                        </th>
                        <th>
                            <div className="flex items-center gap-1">
                                    End Date
                            </div>
                        </th>
                        <th>Type</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.map((leave: Leave) => (
                        <tr key={leave.id} className="hover">
                            <td>
                                <div className="text-sm">{leave.ownerEmail}</div>
                            </td>
                            <td>{formatLeaveDate(leave.startDate, leave.isStartHalfDay, 'start')}</td>
                            <td>{formatLeaveDate(leave.endDate, leave.isEndHalfDay, 'end')}</td>
                            <td>{LeaveType[leave.type]}</td>
                            <td><LeaveStatusBadge status={leave.status} /></td>
                            <td className="text-right">
                                <div className="join">
                                    {leave.status === LeaveStatus.Pending && (
                                        <>
                                            <button
                                                className="btn btn-xs btn-ghost join-item text-success tooltip tooltip-left" data-tip="Approve"
                                                onClick={() => setConfirmState({ isOpen: true, type: 'approve', leaveId: leave.id })}
                                                disabled={isApproving || isRejecting || isDeleting}
                                            >
                                                {isApproving ? <span className="loading loading-spinner loading-xs"></span> : <FaCheck />}
                                            </button>
                                            <button
                                                className="btn btn-xs btn-ghost join-item text-error tooltip tooltip-left" data-tip="Reject"
                                                onClick={() => setConfirmState({ isOpen: true, type: 'reject', leaveId: leave.id })}
                                                disabled={isApproving || isRejecting || isDeleting}
                                            >
                                                {isRejecting ? <span className="loading loading-spinner loading-xs"></span> : <FaTimes />}
                                            </button>
                                            {/* <button
                                                className="btn btn-xs btn-ghost join-item text-error tooltip tooltip-left" data-tip="Delete"
                                                onClick={() => setConfirmState({ isOpen: true, type: 'delete', leaveId: leave.id })}
                                                disabled={isApproving || isRejecting || isDeleting}
                                            >
                                                {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : <FaTrash />}
                                            </button> */}
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => {
                    if (confirmState.type && confirmState.leaveId) {
                        if (confirmState.type === 'approve') onApprove(confirmState.leaveId);
                        if (confirmState.type === 'reject') onReject(confirmState.leaveId);
                        if (confirmState.type === 'delete') onDelete(confirmState.leaveId);
                    }
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                }}
                title={confirmState.type === 'delete' ? 'Delete Leave Request' : confirmState.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                confirmText={confirmState.type === 'delete' ? 'Delete' : confirmState.type === 'approve' ? 'Approve' : 'Reject'}
                confirmButtonClass={confirmState.type === 'delete' ? 'btn-error' : confirmState.type === 'approve' ? 'btn-success' : 'btn-error'}
                isLoading={isApproving || isRejecting || isDeleting}
            >
                {confirmState.type === 'delete' ? 'Are you sure you want to delete this leave request?' :
                 confirmState.type === 'approve' ? 'Are you sure you want to approve this leave request?' :
                 'Are you sure you want to reject this leave request?'}
            </ConfirmDialog>
        </div>
    );
};
