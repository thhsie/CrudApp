import { Leave, LeaveStatus, LeaveType } from '../../types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { FaCheck, FaTimes } from 'react-icons/fa';

// Helper function (copied from AdminDashboard)
const formatDate = (dateString: string | Date): string => {
    try {
        return new Intl.DateTimeFormat('en-CA', { // YYYY-MM-DD format
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date(dateString));
    } catch {
        return 'Invalid Date';
    }
};

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

import { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type LeaveSortKey = 'startDate' | 'endDate' | 'none';

export const LeaveTable = ({
    leaves,
    onApprove,
    onReject,
    onDelete,
    isApproving,
    isRejecting,
    isDeleting
}: LeaveTableProps) => {
    const [sortConfig, setSortConfig] = useState<{ key: LeaveSortKey; direction: 'asc' | 'desc' }>({
        key: 'none',
        direction: 'asc'
    });
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | 'delete' | null;
        leaveId: number | null;
    }>({ isOpen: false, type: null, leaveId: null });

    const sortedLeaves = useMemo(() => {
        if (!leaves) return [];
        if (sortConfig.key === 'none') return leaves;
        return [...leaves].sort((a, b) => {
            const sortKey = sortConfig.key as 'startDate' | 'endDate';
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue === undefined || bValue === undefined) return 0;

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [leaves, sortConfig]);

    const handleSort = (key: Exclude<LeaveSortKey, 'none'>) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

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
                                <button onClick={() => handleSort('startDate')} className="flex items-center gap-1">
                                    Start Date
                                    {sortConfig.key === 'startDate' ? (
                                        sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                    ) : <FaSort />}
                                </button>
                                {sortConfig.key === 'startDate' && (
                                    <button onClick={() => setSortConfig({ key: 'none', direction: 'asc' })} className="btn btn-xs btn-ghost p-0">
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        </th>
                        <th>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleSort('endDate')} className="flex items-center gap-1">
                                    End Date
                                    {sortConfig.key === 'endDate' ? (
                                        sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                    ) : <FaSort />}
                                </button>
                                {sortConfig.key === 'endDate' && (
                                    <button onClick={() => setSortConfig({ key: 'none', direction: 'asc' })} className="btn btn-xs btn-ghost p-0">
                                        <FaTimes />
                                    </button>
                                )}
                            </div>
                        </th>
                        <th>Type</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedLeaves.map((leave: Leave) => (
                        <tr key={leave.id} className="hover">
                            <td>
                                <div className="text-sm">{leave.ownerEmail}</div>
                            </td>
                            <td>{formatDate(leave.startDate)}</td>
                            <td>{formatDate(leave.endDate)}</td>
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
