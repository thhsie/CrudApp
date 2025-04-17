import { Leave, LeaveStatus, LeaveType } from '../../types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatLeaveDate } from '../../utils/dateUtils';

interface UserLeaveTableProps {
    leaves: Leave[];
    onDelete: (id: number) => void;
    isDeleting: boolean;
}

export const UserLeaveTable = ({
    leaves,
    onDelete,
    isDeleting
}: UserLeaveTableProps) => {

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        leaveId: number | null;
    }>({ isOpen: false, leaveId: null });

    if (!leaves || leaves.length === 0) {
        return null;
    }

    return (
        <div className="overflow-x-auto">
            <table className="table table-sm table-zebra w-full">
                <thead className="bg-base-200">
                    <tr>
                        <th>Type</th>
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
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leaves.map((leave: Leave) => (
                        <tr key={leave.id} className="hover">
                            <td>{LeaveType[leave.type]}</td>
                            <td>{formatLeaveDate(leave.startDate, leave.isStartHalfDay, 'start')}</td>
                            <td>{formatLeaveDate(leave.endDate, leave.isEndHalfDay, 'end')}</td>
                            <td><LeaveStatusBadge status={leave.status} /></td>
                            <td className="text-right">
                                <div className="join">
                                    {leave.status === LeaveStatus.Pending && (
                                    <button
                                        className="btn btn-xs btn-ghost join-item text-error tooltip tooltip-left" data-tip="Delete"
                                        onClick={() => setConfirmState({ isOpen: true, leaveId: leave.id })}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : <FaTrash />}
                                    </button>
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
                    if (confirmState.leaveId) {
                        onDelete(confirmState.leaveId);
                    }
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                }}
                title="Delete Leave Request"
                confirmText="Delete"
                confirmButtonClass="btn-error"
                isLoading={isDeleting}
            >
                Are you sure you want to delete this leave request?
            </ConfirmDialog>
        </div>
    );
};
