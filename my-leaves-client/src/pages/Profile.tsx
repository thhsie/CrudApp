// --- ./my-leaves-client/src/pages/Profile.tsx ---
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLeaves } from '../hooks/useLeaves';
import { Loading } from '../components/ui/Loading';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';

export const Profile = () => {
  const { user, isLoggingIn, errorLogin} = useAuth(); // Get user data from AuthContext

  // Fetch leave stats using the user leaves hook (first page is enough for counts)
  const { useUserLeavesInfinite } = useLeaves();
  const {
    data: userLeavesFirstPage,
    isLoading: isLoadingLeaveStats,
    error: errorLeaveStats,
  } = useUserLeavesInfinite(1); // Fetch only 1 page size 1 (we only need counts)

  // Extract leave stats from the first page data
  const leaveStats = React.useMemo(() => {
    const firstPage = userLeavesFirstPage?.pages[0];
    if (!firstPage) return { total: 0, pending: 0, approved: 0, rejected: 0 };
    return {
      total: firstPage.totalCount,
      pending: firstPage.pendingCount,
      approved: firstPage.approvedCount,
      rejected: firstPage.rejectedCount,
    };
  }, [userLeavesFirstPage]);

  // Handle combined loading state
  const isLoading = isLoggingIn || (isLoadingLeaveStats && !userLeavesFirstPage); // Loading if user OR initial stats are loading

  // Handle combined error state
  const displayError = errorLogin || (errorLeaveStats && !userLeavesFirstPage);

  if (isLoading) {
    return <div className="flex justify-center items-center p-10"><Loading size="lg" /></div>;
  }

  if (displayError) {
    return <div className="p-6"><ErrorDisplay message={(displayError as Error)?.message || "Failed to load profile data."} /></div>;
  }

  if (!user) {
      // Should be handled by router, but good fallback
      return <div className="p-6"><ErrorDisplay message={"User data not found."} /></div>;
  }


  return (
    <div className="space-y-6 md:space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">Profile details</h1>

      {/* User Information Card */}
      <div className="card card-bordered bg-base-200">
        <div className="card-body flex-col sm:flex-row items-center gap-4 md:gap-6">
           {/* Avatar Placeholder */}
           <div className="avatar placeholder">
                <div className="bg-secondary text-neutral-content rounded-full flex justify-center items-center w-16 md:w-20">
                    <span className="flex items-center justify-center pt-3 font-bold text-5xl">{user.email ? user.email[0].toUpperCase() : '?'}</span>
                </div>
            </div>
            {/* User Details */}
            <div className="text-center sm:text-left">
                <h2 className="card-title text-xl md:text-2xl">{user.email}</h2>
                <p className="text-base-content/70 text-sm mt-1">User ID: {user.id}</p>
                {user.isAdmin ? (
                     <div className="badge badge-secondary badge-outline mt-2">Administrator</div>
                ) : (
                     <div className="badge badge-secondary badge-outline mt-2">Standard User</div>
                )}
            </div>
        </div>
      </div>

      {/* Leave Balances Card */}
       <div className="card card-bordered bg-base-100 border border-base-300">
        <div className="card-body">
            <h2 className="card-title mb-4">Your Leave Balances</h2>
            {user.leaveBalances ? (
                <div className="stats stats-vertical sm:stats-horizontal w-full">
                    <div className="stat">
                        <div className="stat-title">Annual</div>
                        <div className="stat-value text-primary">{user.leaveBalances.annualLeavesBalance}</div>
                        <div className="stat-desc">Days remaining</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Sick</div>
                        <div className="stat-value text-info">{user.leaveBalances.sickLeavesBalance}</div>
                         <div className="stat-desc">Days remaining</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Special</div>
                        <div className="stat-value text-accent">{user.leaveBalances.specialLeavesBalance}</div>
                         <div className="stat-desc">Days remaining</div>
                    </div>
                </div>
            ) : (
                 <p className="text-base-content/60 italic">Leave balance information is currently unavailable.</p>
            )}
        </div>
      </div>

       {/* Leave Statistics Card */}
       <div className="card card-bordered bg-base-100 border border-base-300">
        <div className="card-body">
             <h2 className="card-title mb-4">Your Leave Request Statistics</h2>
              {/* Use stats component similar to dashboard */}
               <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
                    <div className="stat">
                        <div className="stat-title">Total Submitted</div>
                         <div className="stat-value">{leaveStats.total}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Pending</div>
                        <div className="stat-value text-warning">{leaveStats.pending}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Approved</div>
                        <div className="stat-value text-success">{leaveStats.approved}</div>
                    </div>
                     <div className="stat">
                        <div className="stat-title">Rejected</div>
                         <div className="stat-value text-error">{leaveStats.rejected}</div>
                    </div>
                </div>
        </div>
       </div>

    </div>
  );
};

// Export the component
export default Profile; // Or just export const Profile = ...