import { useState } from 'react';
import { LeaveStatus, PaginatedLeaveResponse } from '../../types/leave';
import { LeaveCard } from './LeaveCard';
import { Loading } from '../ui/Loading';
import { ErrorDisplay } from '../ui/ErrorDisplay';
import { useAuth } from '../../contexts/AuthContext';

interface LeaveListProps {
  response: PaginatedLeaveResponse;
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
  response,
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
    ? response.data
    : response.data.filter(leave => leave.status === filter);

  const counts = {
    all: response.totalCount,
    [LeaveStatus.Pending]: response.pendingCount,
    [LeaveStatus.Approved]: response.approvedCount,
    [LeaveStatus.Rejected]: response.rejectedCount,
  };

  const showTabs = !isLoading && response.data.length > 0;

  return (
    <div>
      {/* Filter Tabs */}
      {showTabs && (
          <div role="tablist" className="tabs tabs-box mb-6 bg-base-200 p-1">
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
        ) : response.data.length === 0 ? (
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
