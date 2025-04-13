import { Leave, LeaveStatus } from '../../types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { FaTimes, FaTrash } from 'react-icons/fa';

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

interface UserLeaveTableProps {
    leaves: Leave[];
    onDelete: (id: number) => void;
    isDeleting: boolean;
}

import { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { ConfirmDialog } from '../ui/ConfirmDialog';

type LeaveSortKey = 'startDate' | 'endDate' | 'none';

export const UserLeaveTable = ({
    leaves,
    onDelete,
    isDeleting
}: UserLeaveTableProps) => {
    const [sortConfig, setSortConfig] = useState<{ key: LeaveSortKey; direction: 'asc' | 'desc' }>({
        key: 'none',
        direction: 'asc'
    });
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        leaveId: number | null;
    }>({ isOpen: false, leaveId: null });

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
                        <th>Type</th>
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
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedLeaves.map((leave: Leave) => (
                        <tr key={leave.id} className="hover">
                            <td>{leave.type}</td>
                            <td>{formatDate(leave.startDate)}</td>
                            <td>{formatDate(leave.endDate)}</td>
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
