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

  // Determine counts for tabs
  const counts = {
      all: leaves.length,
      [LeaveStatus.Pending]: leaves.filter(l => l.status === LeaveStatus.Pending).length,
      [LeaveStatus.Approved]: leaves.filter(l => l.status === LeaveStatus.Approved).length,
      [LeaveStatus.Rejected]: leaves.filter(l => l.status === LeaveStatus.Rejected).length,
  }

  // Loading and Error States are handled by the parent component now

  if (!isLoading && !error && !leaves?.length) {
      return <p className="text-center py-8 text-base-content/70">No leave requests found.</p>;
  }

  return (
    <div>
      {/* Filter Tabs - Using daisyUI 'tabs' component */}
      <div role="tablist" className="tabs tabs-lifted mb-4"> {/* Use tabs component */}
        <button
          role="tab"
          className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
          onClick={() => setFilter('all')}
          aria-selected={filter === 'all'} // Accessibility
        >
          All ({counts.all})
        </button>
        <button
          role="tab"
          className={`tab ${filter === LeaveStatus.Pending ? 'tab-active [--tab-bg:oklch(var(--wa))]' : ''}`} // Use warning color for pending bg
          onClick={() => setFilter(LeaveStatus.Pending)}
           aria-selected={filter === LeaveStatus.Pending}
        >
          Pending ({counts[LeaveStatus.Pending]})
        </button>
        <button
          role="tab"
          className={`tab ${filter === LeaveStatus.Approved ? 'tab-active [--tab-bg:oklch(var(--su))]' : ''}`} // Use success color
          onClick={() => setFilter(LeaveStatus.Approved)}
           aria-selected={filter === LeaveStatus.Approved}
        >
          Approved ({counts[LeaveStatus.Approved]})
        </button>
        <button
          role="tab"
          className={`tab ${filter === LeaveStatus.Rejected ? 'tab-active [--tab-bg:oklch(var(--er))]' : ''}`} // Use error color
          onClick={() => setFilter(LeaveStatus.Rejected)}
           aria-selected={filter === LeaveStatus.Rejected}
        >
          Rejected ({counts[LeaveStatus.Rejected]})
        </button>
         {/* Add empty tab to fill space if needed */}
         <span role="tab" className="tab grow [--tab-border-color:transparent]"></span>
      </div>

      {/* Leave Cards List */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <p className="text-center py-4 text-base-content/70">No leaves match the selected filter.</p>
        ) : (
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