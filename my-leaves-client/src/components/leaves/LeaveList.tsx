import React, { useState } from 'react';
import { Leave, LeaveStatus } from '../../types/leave';
import { LeaveCard } from './LeaveCard'; // Assuming LeaveCard is in the same directory or imported correctly
import { Loading } from '../ui/Loading';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { useAuth } from '../../contexts/AuthContext';

interface LeaveListProps {
  leaves: Leave[]; // This will be the potentially flattened list from infinite queries
  isLoading: boolean; // Overall loading state from parent (initial load)
  error: Error | null; // Overall error state from parent (initial load)
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isDeleting?: boolean;
}

export const LeaveList = ({
  leaves,
  isLoading,
  error,
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

  // *** UPDATED: Calculate counts client-side based on the *full* list passed in ***
  const counts = React.useMemo(() => ({
      all: leaves.length,
      [LeaveStatus.Pending]: leaves.filter(l => l.status === LeaveStatus.Pending).length,
      [LeaveStatus.Approved]: leaves.filter(l => l.status === LeaveStatus.Approved).length,
      [LeaveStatus.Rejected]: leaves.filter(l => l.status === LeaveStatus.Rejected).length,
  }), [leaves]); // Recalculate whenever the leaves list changes

  // Show tabs only if there's data and not in initial loading state
  const showTabs = !isLoading && leaves.length > 0;

  return (
    <div>
      {/* Filter Tabs */}
      {showTabs && (
          <div role="tablist" className="tabs tabs-boxed mb-6 bg-base-200/50 p-1">
            {/* Use client-side calculated counts */}
            <button
              role="tab"
              className={`tab ${filter === 'all' ? 'tab-active' : ''} flex-1`}
              onClick={() => setFilter('all')}
              aria-selected={filter === 'all'}
            >
              All <span className="ml-1 opacity-70">({counts.all})</span>
            </button>
            <button
              role="tab"
              className={`tab ${filter === LeaveStatus.Pending ? 'tab-active !bg-warning !text-warning-content' : ''} flex-1`}
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
        {/* Handle initial loading/error states passed from parent */}
        {isLoading ? (
            <Loading />
        ) : error ? (
            <ErrorDisplay message={error.message || "Failed to load leaves."} />
        ) : leaves.length === 0 ? (
             // Message if no leaves exist at all (after initial load)
             // This is now handled by the parent component usually (Dashboard/LeaveManagement)
             // Keep a fallback here just in case.
             <p className="text-center py-8 text-base-content/70 italic">No leave requests found.</p>
        ) : filteredLeaves.length === 0 ? (
             // Message if filters yield no results
            <p className="text-center py-8 text-base-content/70 italic">No leave requests match the selected filter.</p>
        ) : (
          // Render filtered leaves
          filteredLeaves.map((leave) => (
            <LeaveCard
              key={leave.id}
              leave={leave}
              onApprove={isAdmin ? onApprove : undefined}
              onReject={isAdmin ? onReject : undefined}
              onDelete={onDelete} // Delete logic based on user/status handled internally
              isApproving={isApproving}
              isRejecting={isRejecting}
              isDeleting={isDeleting}
            />
          ))
        )}
      </div>
    </div>
  );
};