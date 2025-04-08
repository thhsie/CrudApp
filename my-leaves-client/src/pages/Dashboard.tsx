import React from 'react';
import { useLeaves } from '../hooks/useLeaves';
import { LeaveList } from '../components/leaves/LeaveList';
import { useAuth } from '../contexts/AuthContext';
// Removed LeaveStatus import, counts come from API
import { Link } from 'react-router-dom';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';

export const Dashboard = () => {
  const { user } = useAuth();
  const {
    // Use the infinite query hook, but we'll only care about the first page here
    useUserLeavesInfinite,
    deleteLeave, // Keep delete mutation for recent list items
    isDeleting,
  } = useLeaves();

  // Fetch user leaves - we only need the first page for the dashboard
  // Set pageSize to 5 directly for recent items list
  const {
      data: userLeavesFirstPage,
      isLoading: isLoadingUserLeaves,
      error: errorUserLeaves,
  } = useUserLeavesInfinite(5); // Fetch only 5 items for the dashboard view

  // Extract data and counts from the first page
  const recentLeaves = userLeavesFirstPage?.pages[0]?.data ?? [];
  const counts = React.useMemo(() => {
      const firstPage = userLeavesFirstPage?.pages[0];
      if (!firstPage) return { pending: 0, approved: 0, rejected: 0, total: 0 };
      // Use the counts provided by the API for accuracy
      return {
          total: firstPage.totalCount,
          pending: firstPage.pendingCount,
          approved: firstPage.approvedCount,
          rejected: firstPage.rejectedCount,
      };
  }, [userLeavesFirstPage?.pages]);


  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.email || 'User'}!</h1>
        <p className="text-base-content/70 mt-1">Your personal leave dashboard.</p>
      </div>

       {/* Display top-level error if fetching initial data failed */}
       {errorUserLeaves && !userLeavesFirstPage && (
           <ErrorDisplay message={(errorUserLeaves as Error).message || "Could not load dashboard data."} />
       )}

      {/* Stats Section - Using API counts */}
      <div className="stats stats-vertical lg:stats-horizontal shadow-md w-full bg-base-100 border border-base-300/50 rounded-lg overflow-hidden">
        <div className="stat">
          <div className="stat-title text-base-content/70">Total Requests</div>
          <div className={`stat-value ${isLoadingUserLeaves && !userLeavesFirstPage ? 'opacity-50' : ''}`}>
            {(isLoadingUserLeaves && !userLeavesFirstPage) ? <span className="loading loading-dots loading-xs"></span> : counts.total}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Pending</div>
          <div className={`stat-value ${(isLoadingUserLeaves && !userLeavesFirstPage) ? 'opacity-50' : 'text-warning'}`}>
             {(isLoadingUserLeaves && !userLeavesFirstPage) ? <span className="loading loading-dots loading-xs"></span> : counts.pending}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title text-base-content/70">Approved</div>
          <div className={`stat-value ${(isLoadingUserLeaves && !userLeavesFirstPage) ? 'opacity-50' : 'text-success'}`}>
             {(isLoadingUserLeaves && !userLeavesFirstPage) ? <span className="loading loading-dots loading-xs"></span> : counts.approved}
          </div>
        </div>
         <div className="stat">
          <div className="stat-title text-base-content/70">Rejected</div>
          <div className={`stat-value ${(isLoadingUserLeaves && !userLeavesFirstPage) ? 'opacity-50' : 'text-error'}`}>
             {(isLoadingUserLeaves && !userLeavesFirstPage) ? <span className="loading loading-dots loading-xs"></span> : counts.rejected}
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
                 {/* Link to view all - Show only if not loading and total > displayed */}
                {!isLoadingUserLeaves && counts.total > recentLeaves.length && (
                    <Link to="/user/leaves" className="btn btn-ghost btn-sm text-primary">
                        View All ({counts.total})
                    </Link>
                )}
            </div>

            {/* Use LeaveList component, passing only recent leaves */}
            {/* Pass loading state based on initial fetch */}
            <LeaveList
                leaves={recentLeaves}
                // Show loading indicator only during the initial fetch
                isLoading={isLoadingUserLeaves && !userLeavesFirstPage}
                // Show error only if initial fetch failed and we have no data
                error={errorUserLeaves && !userLeavesFirstPage ? errorUserLeaves : null}
                onDelete={deleteLeave}
                isDeleting={isDeleting}
            />
             {/* Explicit message if loading succeeded but user has zero requests */}
             {!isLoadingUserLeaves && !errorUserLeaves && counts.total === 0 && (
                 <p className="text-center py-8 text-base-content/70 italic">No leave requests submitted yet.</p>
             )}

            </div>
        </div>

        {/* Quick Actions Section (Remains the same) */}
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