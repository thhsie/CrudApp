// --- Updated File: ./my-leaves-client/src/pages/Dashboard.tsx ---
import React from 'react';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveList } from '../components/leaves/LeaveList';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { LeaveStatus } from '../types/leave';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
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
  const pendingLeaves = isLoadingLeaves ? [] : leaves.filter(leave => leave.status === LeaveStatus.Pending);
  const approvedLeaves = isLoadingLeaves ? [] : leaves.filter(leave => leave.status === LeaveStatus.Approved);
  const rejectedLeaves = isLoadingLeaves ? [] : leaves.filter(leave => leave.status === LeaveStatus.Rejected);

  // Get most recent 5 leaves
  const recentLeaves = isLoadingLeaves ? [] : leaves.slice().sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.email || 'User'}!</h1>
        <p className="text-base-content/70 mt-1">Your leave request summary.</p>
      </div>

      {/* Stats Section - Using daisyUI 'stats' component */}
      <div className="stats stats-vertical lg:stats-horizontal shadow mb-6 w-full bg-base-100"> {/* Added bg */}
        <div className="stat">
          <div className="stat-title">Total Requests</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : ''}`}>
            {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : leaves.length}
            </div>
             {/* <div className="stat-desc">Jan 1st - Feb 1st</div> */}
        </div>
        <div className="stat">
          <div className="stat-title">Pending</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-warning'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : pendingLeaves.length}
             </div>
              {/* <div className="stat-desc">↗︎ 400 (22%)</div> */}
        </div>
        <div className="stat">
          <div className="stat-title">Approved</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-success'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : approvedLeaves.length}
             </div>
              {/* <div className="stat-desc">↘︎ 90 (14%)</div> */}
        </div>
         <div className="stat">
          <div className="stat-title">Rejected</div>
          <div className={`stat-value ${isLoadingLeaves ? 'opacity-50' : 'text-error'}`}>
             {isLoadingLeaves ? <span className="loading loading-dots loading-xs"></span> : rejectedLeaves.length}
             </div>
        </div>
      </div>

      {/* Recent Leaves Section */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Recent Leave Requests</h2>
          {isLoadingLeaves ? (
            <Loading />
          ) : errorLeaves ? (
            <ErrorDisplay message={errorLeaves.message || 'Failed to load recent leaves.'} />
          ) : (
            <LeaveList
              leaves={recentLeaves}
              isLoading={false}
              error={null}
              onDelete={deleteLeave}
              isDeleting={isDeleting}
            />
          )}
          {/* Link to view all */}
          {!isLoadingLeaves && leaves.length > recentLeaves.length && (
            <div className="card-actions justify-end mt-4">
              <Link to="/leaves" className="btn btn-primary btn-sm">
                View All My Leaves
              </Link>
            </div>
          )}
           {/* Message if no leaves exist */}
          {!isLoadingLeaves && !errorLeaves && leaves.length === 0 && (
             <p className="text-center py-4 text-base-content/70">You haven't submitted any leave requests yet.</p>
          )}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Quick Actions</h2>
          <div className="flex flex-wrap gap-4 mt-4">
            {/* Link to the page where the form is toggled */}
            <Link to="/leaves" state={{ showForm: true }} className="btn btn-primary">
              + Request New Leave
            </Link>
            <Link to="/leaves" className="btn btn-outline">
              Manage My Leaves
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};