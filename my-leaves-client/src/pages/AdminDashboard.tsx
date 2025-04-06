import React from 'react';
import { LeaveList } from '../components/leaves/LeaveList';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveStatus } from '../types/leave';

export const AdminDashboard = () => {
  const {
    leaves,
    isLoadingLeaves,
    errorLeaves,
    approveLeave,
    rejectLeave,
    deleteLeave,
    isApproving,
    isRejecting,
    isDeleting,
  } = useLeaves();

 // Calculate counts safely
  const counts = React.useMemo(() => {
      if (isLoadingLeaves || !leaves) return { pending: 0, approved: 0, rejected: 0, total: 0 };
      return {
          total: leaves.length,
          pending: leaves.filter(leave => leave.status === LeaveStatus.Pending).length,
          approved: leaves.filter(leave => leave.status === LeaveStatus.Approved).length,
          rejected: leaves.filter(leave => leave.status === LeaveStatus.Rejected).length,
      };
  }, [leaves, isLoadingLeaves]);

  return (
     <div className="space-y-6 md:space-y-8"> {/* Consistent spacing */}
      <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard - Manage Leaves</h1>

      {/* Stats Section */}
       <div className="stats stats-vertical lg:stats-horizontal shadow-md w-full bg-base-100 border border-base-300/50 rounded-lg overflow-hidden">
         <div className="stat">
          <div className="stat-title text-base-content/70">Total Requests</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : ''}`}>
            {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.total}
            </div>
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Pending Approval</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-warning'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.pending}
             </div>
             <div className="stat-desc text-xs text-warning">{counts.pending > 0 ? `${counts.pending} require action` : 'All caught up!'}</div>
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Approved</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-success'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.approved}
             </div>
        </div>
         <div className="stat">
          <div className="stat-title text-base-content/70">Rejected</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-error'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.rejected}
             </div>
        </div>
      </div>

      {/* All Leaves List - Admin View */}
      <div className="card bg-base-100 shadow-lg border border-base-300/50">
        <div className="card-body p-5 md:p-6">
          <h2 className="card-title mb-4 text-lg">All Leave Requests</h2>
           {/* LeaveList component handles loading/error/empty states internally now */}
           <LeaveList
                leaves={leaves ?? []} // Pass all leaves, ensure array
                isLoading={isLoadingLeaves}
                error={errorLeaves}
                onApprove={approveLeave} // Pass admin actions
                onReject={rejectLeave}
                onDelete={deleteLeave}
                isApproving={isApproving} // Pass mutation status
                isRejecting={isRejecting}
                isDeleting={isDeleting}
            />
        </div>
      </div>
    </div>
  );
};