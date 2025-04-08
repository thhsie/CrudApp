import React from 'react';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveList } from '../components/leaves/LeaveList';
import { useAuth } from '../contexts/AuthContext';
import { LeaveStatus } from '../types/leave';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  // *** UPDATED: Destructure using correct names from useLeaves hook ***
  const {
    userLeaves,
    isLoadingUserLeaves,
    errorUserLeaves,
    deleteLeave,
    isDeleting,
  } = useLeaves();

  // Calculate counts safely after checking if leaves is loaded
  // *** UPDATED: Use correct variable names and states in dependencies ***
  const counts = React.useMemo(() => {
      if (isLoadingUserLeaves || !userLeaves) return { pending: 0, approved: 0, rejected: 0, total: 0 };
      return {
          total: userLeaves.length,
          pending: userLeaves.filter(leave => leave.status === LeaveStatus.Pending).length,
          approved: userLeaves.filter(leave => leave.status === LeaveStatus.Approved).length,
          rejected: userLeaves.filter(leave => leave.status === LeaveStatus.Rejected).length,
      };
  }, [userLeaves, isLoadingUserLeaves]);


  // Get most recent 5 leaves
  const recentLeaves = React.useMemo(() => {
      if (isLoadingUserLeaves || !userLeaves) return [];
      // Sort by ID descending to get most recent submissions assuming IDs are sequential
      return userLeaves.slice().sort((a, b) => b.id - a.id).slice(0, 5);
  }, [userLeaves, isLoadingUserLeaves]);


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
          {/* Use loading state */}
          <div className={`stat-value ${isLoadingUserLeaves ? 'opacity-50' : ''}`}>
            {isLoadingUserLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.total}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Pending</div>
          <div className={`stat-value ${isLoadingUserLeaves ? 'opacity-50' : 'text-warning'}`}>
             {isLoadingUserLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.pending}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Approved</div>
          <div className={`stat-value ${isLoadingUserLeaves ? 'opacity-50' : 'text-success'}`}>
             {isLoadingUserLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.approved}
          </div>
        </div>
         <div className="stat">
          <div className="stat-title text-base-content/70">Rejected</div>
          <div className={`stat-value ${isLoadingUserLeaves ? 'opacity-50' : 'text-error'}`}>
             {isLoadingUserLeaves ? <span className="loading loading-dots loading-xs"></span> : counts.rejected}
          </div>
        </div>
      </div>

      {/* Grid for Recent Leaves & Quick Actions */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Recent Leaves Section */}
        <div className="lg:col-span-2 card bg-base-100 shadow-lg border border-base-300/50">
            <div className="card-body">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="card-title">Recent Leave Requests</h2>
                 {/* Link to view all - Show only if not loading and more leaves exist */}
                {!isLoadingUserLeaves && counts.total > recentLeaves.length && (
                    <Link to="/user/leaves" className="btn btn-ghost btn-sm text-primary">
                        View All ({counts.total})
                    </Link>
                )}
            </div>

            {/* Use LeaveList component, passing only recent leaves */}
            {/* Pass the correct loading/error states */}
            <LeaveList
                leaves={recentLeaves}
                isLoading={isLoadingUserLeaves} // *** UPDATED: Pass correct loading state ***
                error={errorUserLeaves}         // *** UPDATED: Pass correct error state ***
                onDelete={deleteLeave}      // Pass delete action
                isDeleting={isDeleting}
                // No approve/reject needed here
            />

            </div>
        </div>

        {/* Quick Actions Section */}
        <div className="lg:col-span-1 card bg-base-100 shadow-lg border border-base-300/50">
            <div className="card-body">
            <h2 className="card-title mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
                <Link to="/user/leaves" state={{ showForm: true }} className="btn btn-primary w-full">
                    Request New Leave
                </Link>
                <Link to="/user/leaves" className="btn btn-outline w-full">
                    Manage My Leaves
                </Link>
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