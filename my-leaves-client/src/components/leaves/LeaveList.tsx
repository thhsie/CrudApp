// --- Updated File: ./my-leaves-client/src/components/leaves/LeaveList.tsx ---
import React, { useState } from 'react';
import { Leave, LeaveStatus } from '../../types/leave';
import { LeaveCard } from './LeaveCard';
import { Loading } from '../ui/Loading';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { useAuth } from '../../contexts/AuthContext';

interface LeaveListProps {
  leaves: Leave[];
  isLoading: boolean;
  error: Error | null;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isDeleting?: boolean;
}

export const LeaveList = ({
  leaves,
  isLoading, // Note: Parent component handles overall loading/error display now
  error,     // This component primarily focuses on filtering and mapping
  onApprove,
  onReject,
  onDelete,
  isApproving,
  isRejecting,
  isDeleting,
}: LeaveListProps) => {
  const [filter, setFilter] = useState<LeaveStatus | 'all'>('all');
  const { isAdmin } = useAuth();

  const filteredLeaves = filter === 'all'
    ? leaves
    : leaves.filter(leave => leave.status === filter);

  // Calculate counts for tabs
  const counts = React.useMemo(() => ({ // Memoize counts calculation
      all: leaves.length,
      [LeaveStatus.Pending]: leaves.filter(l => l.status === LeaveStatus.Pending).length,
      [LeaveStatus.Approved]: leaves.filter(l => l.status === LeaveStatus.Approved).length,
      [LeaveStatus.Rejected]: leaves.filter(l => l.status === LeaveStatus.Rejected).length,
  }), [leaves]);

  // Don't show tabs if there are no leaves at all and not loading
  const showTabs = leaves.length > 0 && !isLoading;

  return (
    <div>
      {/* Filter Tabs - Use tabs-boxed for a cleaner look */}
      {showTabs && (
          <div role="tablist" className="tabs tabs-boxed mb-6 bg-base-200/50 p-1">
            <button
              role="tab"
              className={`tab ${filter === 'all' ? 'tab-active' : ''} flex-1`} // Use flex-1 for equal width
              onClick={() => setFilter('all')}
              aria-selected={filter === 'all'}
            >
              All <span className="ml-1 opacity-70">({counts.all})</span>
            </button>
            <button
              role="tab"
              className={`tab ${filter === LeaveStatus.Pending ? 'tab-active !bg-warning !text-warning-content' : ''} flex-1`} // Use ! to ensure override, specify text color
              onClick={() => setFilter(LeaveStatus.Pending)}
              aria-selected={filter === LeaveStatus.Pending}
            >
              Pending <span className="ml-1 opacity-70">({counts[LeaveStatus.Pending]})</span>
            </button>
            <button
              role="tab"
              className={`tab ${filter === LeaveStatus.Approved ? 'tab-active !bg-success !text-success-content' : ''} flex-1`}
              onClick={() => setFilter(LeaveStatus.Approved)}
              aria-selected={filter === LeaveStatus.Approved}
            >
              Approved <span className="ml-1 opacity-70">({counts[LeaveStatus.Approved]})</span>
            </button>
            <button
              role="tab"
              className={`tab ${filter === LeaveStatus.Rejected ? 'tab-active !bg-error !text-error-content' : ''} flex-1`}
              onClick={() => setFilter(LeaveStatus.Rejected)}
              aria-selected={filter === LeaveStatus.Rejected}
            >
              Rejected <span className="ml-1 opacity-70">({counts[LeaveStatus.Rejected]})</span>
            </button>
          </div>
      )}

      {/* Leave Cards List */}
      <div className="space-y-4">
        {/* Handle loading/error states passed from parent */}
        {isLoading ? (
            <Loading />
        ) : error ? (
            <ErrorDisplay message={error.message || "Failed to load leaves."} />
        ) : leaves.length === 0 ? (
            // Specific message if no leaves exist at all
             <p className="text-center py-8 text-base-content/70 italic">No leave requests found.</p>
        ) : filteredLeaves.length === 0 ? (
             // Specific message if filters yield no results
            <p className="text-center py-8 text-base-content/70 italic">No leave requests match the selected filter.</p>
        ) : (
          // Render filtered leaves
          filteredLeaves.map((leave) => (
            <LeaveCard
              key={leave.id}
              leave={leave}
              onApprove={isAdmin ? onApprove : undefined} // Pass only if admin
              onReject={isAdmin ? onReject : undefined} // Pass only if admin
              onDelete={onDelete} // Delete logic handled within LeaveCard based on role/status
              isApproving={isApproving} // Pass mutation status
              isRejecting={isRejecting}
              isDeleting={isDeleting}
            />
          ))
        )}
      </div>
    </div>
  );
};