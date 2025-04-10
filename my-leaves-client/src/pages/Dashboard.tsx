/* =============================================
   2. src/pages/Dashboard.tsx (UPDATED)
   ============================================= */
import React, { useState, useMemo, useEffect } from 'react'; // Added useState, useEffect
import { useLeaves } from '../hooks/useLeaves';
import { LeaveList } from '../components/leaves/LeaveList';
import { Feedback } from '../hooks/useAuthQuery'; // Import Feedback type from useAuthQuery
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { Loading } from '../components/ui/Loading'; // Import Loading
import { getApiErrorMessage } from '../services/authService'; // Import error helper

// Re-define or import FeedbackAlert component here (same as in AdminUsers.tsx etc.)
const FeedbackAlert = ({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) => {
    if (!feedback) return null;
    const alertClass = feedback.type === 'success' ? 'alert-success' : 'alert-error';
    useEffect(() => {
        const timer = setTimeout(() => { onClose(); }, 5000);
        return () => clearTimeout(timer);
    }, [feedback, onClose]);

    return (
        <div className="toast toast-end toast-bottom z-50 p-4">
            <div role="alert" className={`alert ${alertClass} shadow-lg`}>
                 {feedback.type === 'success' ? ( <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> )
                 : ( <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> )}
                <span>{feedback.message}</span>
            </div>
        </div>
    );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [pageFeedback, setPageFeedback] = useState<Feedback>(null); // State for feedback
  const {
    useUserLeavesInfinite,
    deleteLeave,
    isDeleting,
    errorDeleting, // Get error state for delete
  } = useLeaves();

  // Fetch only 5 items for the dashboard view
  const {
      data: userLeavesFirstPage,
      isLoading: isLoadingUserLeaves,
      error: errorUserLeaves, // Initial fetch error
  } = useUserLeavesInfinite(5);

  // Extract data and counts from the first page
  const recentLeaves = userLeavesFirstPage?.pages[0]?.data ?? [];
  const counts = useMemo(() => {
      const firstPage = userLeavesFirstPage?.pages[0];
      if (!firstPage) return { pending: 0, approved: 0, rejected: 0, total: 0 };
      return {
          total: firstPage.totalCount,
          pending: firstPage.pendingCount,
          approved: firstPage.approvedCount,
          rejected: firstPage.rejectedCount,
      };
  }, [userLeavesFirstPage?.pages]);

  // Effect to show delete error feedback
   useEffect(() => {
       if (errorDeleting) {
           setPageFeedback({ type: 'error', message: `Delete failed: ${getApiErrorMessage(errorDeleting)}` });
       }
   }, [errorDeleting]);

  // Handler for delete action with feedback
   const handleDelete = (id: number) => {
       setPageFeedback(null); // Clear previous feedback
       // Confirmation dialog is inside LeaveCard
       deleteLeave(id, {
           onSuccess: () => {
               setPageFeedback({ type: 'success', message: `Request #${id} deleted.` });
               // List automatically updates due to query invalidation in useLeaves hook
           },
           // onError handled by useEffect watching errorDeleting
       });
   };

  // Display initial loading state
  if (isLoadingUserLeaves && !userLeavesFirstPage) {
      return (
          <div className="space-y-6 md:space-y-8 p-4">
              <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.email || 'User'}!</h1>
                  <p className="text-base-content/70 mt-1">Your personal leave dashboard.</p>
              </div>
              <div className="flex justify-center items-center p-10">
                  <Loading size="lg" />
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 md:space-y-8 relative"> {/* Add relative for toast */}
        {/* Feedback Alert Display */}
        <FeedbackAlert feedback={pageFeedback} onClose={() => setPageFeedback(null)} />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user?.email || 'User'}!</h1>
        <p className="text-base-content/70 mt-1">Your personal leave dashboard.</p>
      </div>

       {/* Display top-level error if initial fetching failed */}
       {errorUserLeaves && !userLeavesFirstPage && (
           <ErrorDisplay message={getApiErrorMessage(errorUserLeaves) || "Could not load dashboard data."} />
       )}

      {/* Stats Section */}
      <div className="stats stats-vertical lg:stats-horizontal shadow-md w-full bg-base-100 border border-base-300/50 rounded-lg overflow-hidden">
        <div className="stat">
          <div className="stat-title text-base-content/70">Total Requests</div>
          {/* Show loading dots only during initial load */}
          <div className={`stat-value ${(isLoadingUserLeaves && !userLeavesFirstPage) ? 'opacity-50' : ''}`}>
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
                 {/* Link to view all - Show if not loading initially AND total > displayed */}
                {!isLoadingUserLeaves && counts.total > recentLeaves.length && (
                    <Link to="/user/leaves" className="btn btn-ghost btn-sm text-primary">
                        View All ({counts.total})
                    </Link>
                )}
            </div>

            {/* Pass only recent leaves */}
            {/* Loading/Error only shown if initial fetch failed */}
            <LeaveList
                leaves={recentLeaves}
                isLoading={false} // Initial load handled above
                error={null}     // Initial error handled above
                onDelete={handleDelete} // Pass delete handler
                isDeleting={isDeleting} // Pass deleting state
            />
             {/* Explicit message if loading succeeded but user has zero requests */}
             {!isLoadingUserLeaves && !errorUserLeaves && counts.total === 0 && (
                 <p className="text-center py-8 text-base-content/70 italic">No leave requests submitted yet.</p>
             )}
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