// --- Updated File: ./my-leaves-client/src/pages/AdminDashboard.tsx ---
import React from 'react';
// Layout included via router
import { LeaveList } from '../components/leaves/LeaveList';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveStatus } from '../types/leave';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';

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
  const pendingCount = isLoadingLeaves ? 0 : leaves.filter(leave => leave.status === LeaveStatus.Pending).length;
  const approvedCount = isLoadingLeaves ? 0 : leaves.filter(leave => leave.status === LeaveStatus.Approved).length;
  const rejectedCount = isLoadingLeaves ? 0 : leaves.filter(leave => leave.status === LeaveStatus.Rejected).length;

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard - Manage Leaves</h1>

      {/* Stats Section */}
       <div className="stats stats-vertical lg:stats-horizontal shadow mb-6 w-full bg-base-100">
        <div className="stat">
          <div className="stat-title">Total Requests</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : ''}`}>
            {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : leaves.length}
            </div>
        </div>
        <div className="stat">
          <div className="stat-title">Pending Approval</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-warning'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : pendingCount}
             </div>
        </div>
        <div className="stat">
          <div className="stat-title">Approved</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-success'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : approvedCount}
             </div>
        </div>
         <div className="stat">
          <div className="stat-title">Rejected</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-error'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : rejectedCount}
             </div>
        </div>
      </div>

      {/* All Leaves List - Admin View */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="card-title mb-4">All Leave Requests</h2>
          {isLoadingLeaves ? (
            <Loading />
          ) : errorLeaves ? (
            <ErrorDisplay message={errorLeaves.message || 'Failed to load leave requests.'} />
          ) : (
            <LeaveList
                leaves={leaves} // Pass all leaves
                isLoading={false}
                error={null}
                onApprove={approveLeave} // Pass admin actions
                onReject={rejectLeave}
                onDelete={deleteLeave}
                isApproving={isApproving} // Pass mutation status
                isRejecting={isRejecting}
                isDeleting={isDeleting}
            />
           )}
           {/* Message if no leaves exist */}
          {!isLoadingLeaves && !errorLeaves && leaves.length === 0 && (
             <p className="text-center py-4 text-base-content/70">No leave requests found in the system.</p>
          )}
        </div>
      </div>
    </>
  );
};