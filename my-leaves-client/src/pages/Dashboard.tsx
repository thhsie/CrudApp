// --- Updated File: ./my-leaves-client/src/pages/Dashboard.tsx ---
import React from 'react';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveList } from '../components/leaves/LeaveList';
// Layout is handled by router
import { useAuth } from '../contexts/AuthContext';
import { LeaveStatus } from '../types/leave';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const {
    leaves,
    isLoadingLeaves,
    errorLeaves,
    deleteLeave,
    isDeleting,
  } = useLeaves();

  // Calculate counts safely after checking if leaves is loaded
  const counts = React.useMemo(() => {
      if (isLoadingLeaves || !leaves) return { pending: 0, approved: 0, rejected: 0, total: 0 };
      return {
          total: leaves.length,
          pending: leaves.filter(leave => leave.status === LeaveStatus.Pending).length,
          approved: leaves.filter(leave => leave.status === LeaveStatus.Approved).length,
          rejected: leaves.filter(leave => leave.status === LeaveStatus.Rejected).length,
      };
  }, [leaves, isLoadingLeaves]);


  // Get most recent 5 leaves
  const recentLeaves = React.useMemo(() => {
      if (isLoadingLeaves || !leaves) return [];
      return leaves.slice().sort((a, b) => b.id - a.id).slice(0, 5);
  }, [leaves, isLoadingLeaves]);


  return (
    <div className="space-y-6 md:space-y-8"> {/* Consistent spacing */}
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.email || 'User'}!</h1>
        <p className="text-base-content/70 mt-1">Your personal leave dashboard.</p>
      </div>

      {/* Stats Section - Using daisyUI 'stats' component */}
      <div className="stats stats-vertical lg:stats-horizontal shadow-md w-full bg-base-100 border border-base-300/50 rounded-lg overflow-hidden">
        <div className="stat">
          <div className="stat-title text-base-content/70">Total Requests</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : ''}`}>
            {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.total}
          </div>
          {/* <div className="stat-desc text-xs">Current Year</div> */}
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Pending</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-warning'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.pending}
          </div>
          {/* <div className="stat-desc text-xs text-warning">Action Required</div> */}
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Approved</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-success'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.approved}
          </div>
          {/* <div className="stat-desc text-xs">Ready for your time off!</div> */}
        </div>
         <div className="stat">
          <div className="stat-title text-base-content/70">Rejected</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-error'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.rejected}
          </div>
           {/* <div className="stat-desc text-xs text-error">Review details</div> */}
        </div>
      </div>

      {/* Grid for Recent Leaves & Quick Actions */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Recent Leaves Section (Takes more space on large screens) */}
        <div className="lg:col-span-2 card bg-base-100 shadow-lg border border-base-300/50">
            <div className="card-body">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="card-title">Recent Leave Requests</h2>
                 {/* Link to view all */}
                {!isLoadingLeaves && counts.total > recentLeaves.length && (
                    <Link to="/leaves" className="btn btn-ghost btn-sm text-primary">
                        View All
                    </Link>
                )}
            </div>

            {/* Use LeaveList component, passing only recent leaves */}
            <LeaveList
                leaves={recentLeaves}
                isLoading={isLoadingLeaves} // Pass loading state
                error={errorLeaves}         // Pass error state
                onDelete={deleteLeave}      // Pass delete action
                isDeleting={isDeleting}
                // No approve/reject needed here
            />

            {/* Message if no leaves exist is handled within LeaveList now */}
            </div>
        </div>

        {/* Quick Actions Section */}
        <div className="lg:col-span-1 card bg-base-100 shadow-lg border border-base-300/50">
            <div className="card-body">
            <h2 className="card-title mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3"> {/* Vertical actions */}
                {/* Link to the page where the form is toggled */}
                <Link to="/leaves" state={{ showForm: true }} className="btn btn-primary w-full">
                {/* Optional Icon */} Request New Leave
                </Link>
                <Link to="/leaves" className="btn btn-outline w-full">
                Manage My Leaves
                </Link>
                {/* Add other relevant links */}
                 <Link to="/profile" className="btn btn-outline w-full">
                    My Profile
                </Link>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};