import { useState } from 'react';
import { Leave, LeaveStatus } from '../../types/leave';
import { LeaveCard } from './LeaveCard';
import { Loading } from '../ui/Loading';
import { ErrorDisplay } from '../ui/ErrorDisplay';

interface LeaveListProps {
  leaves: Leave[];
  isLoading: boolean;
  error: Error | null;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const LeaveList = ({
  leaves,
  isLoading,
  error,
  onApprove,
  onReject,
  onDelete,
}: LeaveListProps) => {
  const [filter, setFilter] = useState<LeaveStatus | 'all'>('all');

  const filteredLeaves = filter === 'all'
    ? leaves
    : leaves.filter(leave => leave.status === filter);

  if (isLoading) return <Loading />;
  if (error) return <ErrorDisplay message="Failed to load leave requests" />;
  if (!leaves.length) return <p className="text-center py-8">No leave requests found.</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-active' : 'btn-ghost'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`btn btn-sm ${filter === LeaveStatus.Pending ? 'btn-warning' : 'btn-ghost'}`}
          onClick={() => setFilter(LeaveStatus.Pending)}
        >
          Pending
        </button>
        <button
          className={`btn btn-sm ${filter === LeaveStatus.Approved ? 'btn-success' : 'btn-ghost'}`}
          onClick={() => setFilter(LeaveStatus.Approved)}
        >
          Approved
        </button>
        <button
          className={`btn btn-sm ${filter === LeaveStatus.Rejected ? 'btn-error' : 'btn-ghost'}`}
          onClick={() => setFilter(LeaveStatus.Rejected)}
        >
          Rejected
        </button>
      </div>

      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <p className="text-center py-4">No leaves match the selected filter.</p>
        ) : (
          filteredLeaves.map((leave) => (
            <LeaveCard
              key={leave.id}
              leave={leave}
              onApprove={onApprove}
              onReject={onReject}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};