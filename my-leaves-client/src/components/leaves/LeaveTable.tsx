import { Leave, LeaveStatus, LeaveType } from '../../types/leave';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

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

export const LeaveTable = ({
    leaves,
    onApprove,
    onReject,
    onDelete,
    isApproving,
    isRejecting,
    isDeleting
}: LeaveTableProps) => {

    // Handle empty state within the component if needed, or rely on parent
    if (!leaves || leaves.length === 0) {
        // Optionally return a message here, but AdminDashboard already handles the main empty state
        return null; // Or a specific empty table message if preferred
    }

    return (
        <div className="overflow-x-auto">
            <table className="table table-sm table-zebra w-full">
                {/* head */}
                <thead className="bg-base-200">
                    <tr>
                        <th>User</th>
                        <th>Start Date</th>
                        <th>End Date</th>
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
                                                onClick={() => onApprove(leave.id)}
                                                disabled={isApproving || isRejecting || isDeleting}
                                            >
                                                {isApproving ? <span className="loading loading-spinner loading-xs"></span> : <FaCheck />}
                                            </button>
                                            <button
                                                className="btn btn-xs btn-ghost join-item text-warning tooltip tooltip-left" data-tip="Reject"
                                                onClick={() => onReject(leave.id)}
                                                disabled={isApproving || isRejecting || isDeleting}
                                            >
                                                {isRejecting ? <span className="loading loading-spinner loading-xs"></span> : <FaTimes />}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        className="btn btn-xs btn-ghost join-item text-error tooltip tooltip-left" data-tip="Delete"
                                        onClick={() => onDelete(leave.id)}
                                        disabled={isApproving || isRejecting || isDeleting}
                                    >
                                        {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : <FaTrash />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
